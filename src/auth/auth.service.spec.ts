import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { BcryptService } from './bcrypt.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from './role.constant';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  const response = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as never;

  let usersService: {
    create: jest.Mock;
    findOne: jest.Mock;
    findOneByEmail: jest.Mock;
    findOneByEmailWithPassword: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
    updateLastLoginAt: jest.Mock;
    remove: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let configService: {
    get: jest.Mock;
    getOrThrow: jest.Mock;
  };
  let bcryptService: {
    hash: jest.Mock;
    compare: jest.Mock;
  };
  let refreshTokensRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  };
  let authService: AuthService;

  beforeEach(() => {
    usersService = {
      create: jest.fn(),
      findOne: jest.fn(),
      findOneByEmail: jest.fn(),
      findOneByEmailWithPassword: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updateLastLoginAt: jest.fn(),
      remove: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string, fallback?: string | number) => {
        const values: Record<string, string | number> = {
          NODE_ENV: 'test',
          JWT_ACCESS_TTL: '15m',
          JWT_REFRESH_TTL: '7d',
        };

        return values[key] ?? fallback ?? '';
      }),
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'jwt-secret',
          JWT_REFRESH_SECRET: 'refresh-secret',
        };

        return values[key];
      }),
    };
    bcryptService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    refreshTokensRepository = {
      create: jest.fn((value) => value as RefreshToken),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      bcryptService as unknown as BcryptService,
      refreshTokensRepository as unknown as Repository<RefreshToken>,
    );

    jest.clearAllMocks();
  });

  it('registers a user and returns an access token', async () => {
    bcryptService.hash.mockResolvedValueOnce('password-hash');
    usersService.create.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: 'Ada',
      roles: [Role.User],
      lastLoginAt: new Date(),
    } as never);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    bcryptService.hash.mockResolvedValueOnce('refresh-hash');

    const result = await authService.register(
      {
        name: 'Ada',
        email: 'ada@example.com',
        password: 'password123',
      },
      response,
    );

    expect(usersService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ada',
        email: 'ada@example.com',
        roles: [Role.User],
      }),
    );
    expect(result).toEqual({ accessToken: 'access-token', expiresIn: 900 });
    expect(response.cookie).toHaveBeenCalled();
  });

  it('returns a generic error when registration hits a duplicate email', async () => {
    bcryptService.hash.mockResolvedValue('password-hash');
    usersService.create.mockRejectedValue(new ConflictException('duplicate'));

    await expect(
      authService.register(
        {
          name: 'Ada',
          email: 'ada@example.com',
          password: 'password123',
        },
        response,
      ),
    ).rejects.toThrow(new ConflictException('Registration failed'));
  });

  it('logs a user in with valid credentials', async () => {
    usersService.findOneByEmailWithPassword.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: 'Ada',
      password: 'password-hash',
      roles: [Role.User],
      lastLoginAt: null,
    } as never);
    bcryptService.compare.mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    bcryptService.hash.mockResolvedValue('refresh-hash');

    const result = await authService.login(
      { email: 'ada@example.com', password: 'password123' },
      response,
    );

    expect(usersService.updateLastLoginAt).toHaveBeenCalledWith(
      'user-id',
      expect.any(Date),
    );
    expect(result).toEqual({ accessToken: 'access-token', expiresIn: 900 });
  });

  it('rejects login for an unknown email', async () => {
    usersService.findOneByEmailWithPassword.mockResolvedValue(null);

    await expect(
      authService.login(
        { email: 'missing@example.com', password: 'password123' },
        response,
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('rejects login for a wrong password', async () => {
    usersService.findOneByEmailWithPassword.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      password: 'password-hash',
      roles: [Role.User],
    } as never);
    bcryptService.compare.mockResolvedValue(false);

    await expect(
      authService.login(
        { email: 'ada@example.com', password: 'wrong-password' },
        response,
      ),
    ).rejects.toThrow(new UnauthorizedException('Invalid email or password'));
  });

  it('rotates a refresh token successfully', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-id',
      sid: 'session-id',
      email: 'ada@example.com',
      roles: [Role.User],
      typ: 'refresh',
    });
    refreshTokensRepository.findOne.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    bcryptService.compare.mockResolvedValue(true);
    usersService.findOne.mockResolvedValue({
      id: 'user-id',
      email: 'ada@example.com',
      name: 'Ada',
      roles: [Role.User],
    } as never);
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');
    bcryptService.hash.mockResolvedValue('new-refresh-hash');

    const result = await authService.refresh('raw-refresh-token', response);

    expect(refreshTokensRepository.delete).toHaveBeenCalledWith({
      id: 'session-id',
    });
    expect(result).toEqual({ accessToken: 'new-access-token', expiresIn: 900 });
  });

  it('rejects expired refresh tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(
      authService.refresh('expired-refresh-token', response),
    ).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
  });

  it('rejects refresh tokens with the wrong type', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-id',
      sid: 'session-id',
      email: 'ada@example.com',
      roles: [Role.User],
      typ: 'access',
    });

    await expect(
      authService.refresh('not-a-refresh-token', response),
    ).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));
  });

  it('revokes all sessions when the stored hash does not match', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'user-id',
      sid: 'session-id',
      email: 'ada@example.com',
      roles: [Role.User],
      typ: 'refresh',
    });
    refreshTokensRepository.findOne.mockResolvedValue({
      id: 'session-id',
      userId: 'user-id',
      tokenHash: 'stored-hash',
      expiresAt: new Date(Date.now() + 60_000),
    } as never);
    bcryptService.compare.mockResolvedValue(false);

    await expect(
      authService.refresh('replayed-refresh-token', response),
    ).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));

    expect(refreshTokensRepository.delete).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });

  it('logs out a specific session', async () => {
    await authService.logout('user-id', 'session-id');

    expect(refreshTokensRepository.delete).toHaveBeenCalledWith({
      id: 'session-id',
      userId: 'user-id',
    });
  });
});
