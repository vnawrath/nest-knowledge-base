import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { HealthModule } from './health/health.module';
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
        CORS_ORIGIN: Joi.string().default('*'),
      }),
    }),
    HealthModule,
    ViteModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*path');
  }
}
