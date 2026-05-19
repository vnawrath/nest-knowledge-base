import { randomUUID } from 'node:crypto';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Response } from 'express';
import { Repository } from 'typeorm';
import {
  ACCESS_TOKEN_TTL_FALLBACK,
  REFRESH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_PATH,
  REFRESH_TOKEN_TTL_FALLBACK,
} from './auth.constants';
import { BcryptService } from './bcrypt.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { Role } from './role.constant';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly bcryptService: BcryptService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async register(
    dto: RegisterDto,
    response: Response,
  ): Promise<TokenResponseDto> {
    try {
      const passwordHash = await this.bcryptService.hash(dto.password);
      const user = await this.usersService.create({
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        roles: [Role.User],
        lastLoginAt: new Date(),
      });

      return this.generateTokens(user, response);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Registration failed');
      }

      throw error;
    }
  }

  async login(dto: LoginDto, response: Response): Promise<TokenResponseDto> {
    const user = await this.usersService.findOneByEmailWithPassword(dto.email);

    if (!user?.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await this.bcryptService.compare(
      dto.password,
      user.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const lastLoginAt = new Date();
    await this.usersService.updateLastLoginAt(user.id, lastLoginAt);
    user.lastLoginAt = lastLoginAt;

    return this.generateTokens(user, response);
  }

  async refresh(
    refreshToken: string,
    response: Response,
  ): Promise<TokenResponseDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { id: payload.sid, userId: payload.sub },
    });

    if (!storedToken) {
      await this.revokeAllSessions(payload.sub);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (storedToken.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokensRepository.delete({ id: storedToken.id });
      throw new UnauthorizedException('Refresh token expired');
    }

    const tokenMatches = await this.bcryptService.compare(
      refreshToken,
      storedToken.tokenHash,
    );

    if (!tokenMatches) {
      await this.revokeAllSessions(payload.sub);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokensRepository.delete({ id: storedToken.id });

    const user = await this.usersService.findOne(payload.sub);
    return this.generateTokens(user, response);
  }

  async logout(userId: string, sessionId: string): Promise<void> {
    await this.refreshTokensRepository.delete({ id: sessionId, userId });
  }

  me(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  clearRefreshCookie(response: Response): void {
    response.clearCookie(
      REFRESH_TOKEN_COOKIE_NAME,
      this.getRefreshCookieOptions(),
    );
  }

  private async generateTokens(
    user: User,
    response: Response,
  ): Promise<TokenResponseDto> {
    const sessionId = randomUUID();
    const accessTtl = this.getAccessTokenTtl();
    const refreshTtl = this.getRefreshTokenTtl();
    const basePayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sid: sessionId,
    } satisfies Omit<JwtPayload, 'typ'>;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, typ: 'access' },
        {
          secret: this.configService.getOrThrow<string>('JWT_SECRET'),
          expiresIn: accessTtl,
        },
      ),
      this.jwtService.signAsync(
        { ...basePayload, typ: 'refresh' },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: refreshTtl,
        },
      ),
    ]);

    const refreshTokenHash = await this.bcryptService.hash(refreshToken);
    const refreshTokenEntity = this.refreshTokensRepository.create({
      id: sessionId,
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + this.ttlToSeconds(refreshTtl) * 1000),
    });

    await this.refreshTokensRepository.save(refreshTokenEntity);

    response.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      this.getRefreshCookieOptions(),
    );

    return {
      accessToken,
      expiresIn: this.ttlToSeconds(accessTtl),
    };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.typ !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return payload;
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    await this.refreshTokensRepository.delete({ userId });
  }

  private getAccessTokenTtl(): string {
    return this.configService.get<string>(
      'JWT_ACCESS_TTL',
      ACCESS_TOKEN_TTL_FALLBACK,
    );
  }

  private getRefreshTokenTtl(): string {
    return this.configService.get<string>(
      'JWT_REFRESH_TTL',
      REFRESH_TOKEN_TTL_FALLBACK,
    );
  }

  private getRefreshCookieOptions() {
    return {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure:
        this.configService.get<string>('NODE_ENV', 'development') ===
        'production',
      path: REFRESH_TOKEN_COOKIE_PATH,
    };
  }

  private ttlToSeconds(ttl: string): number {
    const numericValue = Number(ttl);
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }

    const match = ttl.match(/^(\d+)([smhd])$/i);
    if (!match) {
      throw new Error(`Unsupported TTL format: ${ttl}`);
    }

    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        throw new Error(`Unsupported TTL unit: ${unit}`);
    }
  }
}
