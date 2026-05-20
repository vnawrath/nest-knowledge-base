import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS_FALLBACK } from './auth.constants';

@Injectable()
export class BcryptService {
  constructor(private readonly configService: ConfigService) {}

  hash(value: string): Promise<string> {
    return bcrypt.hash(value, this.getRounds());
  }

  compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }

  private getRounds(): number {
    return this.configService.get<number>(
      'BCRYPT_ROUNDS',
      BCRYPT_ROUNDS_FALLBACK,
    );
  }
}
