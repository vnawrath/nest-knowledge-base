import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthModule } from './auth/auth.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ViteModule } from './vite/vite.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        APP_BASE_URL: Joi.string().uri().default('http://localhost:3000'),
        CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
        DB_PATH: Joi.string().optional(),
        DB_SYNCHRONIZE: Joi.boolean().default(true),
        DB_LOGGING: Joi.boolean().default(false),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string()
          .required()
          .invalid(Joi.ref('JWT_SECRET')),
        JWT_ACCESS_TTL: Joi.string().default('15m'),
        JWT_REFRESH_TTL: Joi.string().default('7d'),
        BCRYPT_ROUNDS: Joi.number().integer().min(4).default(10),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV', 'development');
        const configuredPath = config.get<string>('DB_PATH');
        const databasePath =
          nodeEnv === 'test' ? ':memory:' : (configuredPath ?? 'data/app.db');

        if (databasePath !== ':memory:') {
          const absoluteDatabasePath = resolve(process.cwd(), databasePath);
          mkdirSync(dirname(absoluteDatabasePath), { recursive: true });

          return {
            type: 'better-sqlite3' as const,
            database: absoluteDatabasePath,
            autoLoadEntities: true,
            synchronize: config.get<boolean>('DB_SYNCHRONIZE', true),
            logging: config.get<boolean>('DB_LOGGING', false),
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: databasePath,
          autoLoadEntities: true,
          synchronize: config.get<boolean>('DB_SYNCHRONIZE', true),
          logging: config.get<boolean>('DB_LOGGING', false),
        };
      },
    }),
    AuthModule,
    HealthModule,
    UsersModule,
    ViteModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
