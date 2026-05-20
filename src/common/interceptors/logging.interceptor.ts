import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const { method, url } = req;
    const correlationId = req.correlationId;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.log(method, url, res.statusCode, start, correlationId);
        },
        error: (err: unknown) => {
          const status = err instanceof HttpException ? err.getStatus() : 500;
          this.log(method, url, status, start, correlationId);
        },
      }),
    );
  }

  private log(
    method: string,
    url: string,
    status: number,
    start: number,
    correlationId?: string,
  ): void {
    const duration = Date.now() - start;
    const msg = `${method} ${url} ${status} ${duration}ms`;
    this.logger.log(correlationId ? `[${correlationId}] ${msg}` : msg);
  }
}
