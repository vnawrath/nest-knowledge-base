import {
  Injectable,
  Logger,
  type INestApplication,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Express, Request } from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import serveStatic from 'serve-static';
import type { ViteDevServer } from 'vite';

@Injectable()
export class ViteService implements OnModuleDestroy {
  private readonly logger = new Logger(ViteService.name);
  private middlewareApplied = false;
  private productionIndexHtml?: string;
  private viteServer?: ViteDevServer;

  constructor(private readonly configService: ConfigService) {}

  async applyMiddleware(app: INestApplication): Promise<void> {
    if (this.middlewareApplied) {
      return;
    }

    const expressApp = app.getHttpAdapter().getInstance() as Express;
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv === 'production') {
      await this.applyProductionMiddleware(expressApp);
    } else {
      await this.applyDevelopmentMiddleware(expressApp);
    }

    this.middlewareApplied = true;
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.viteServer) {
      return;
    }

    await this.viteServer.close();
    this.viteServer = undefined;
  }

  private async applyDevelopmentMiddleware(expressApp: Express): Promise<void> {
    const clientRoot = path.resolve(process.cwd(), 'client');
    const configFile = path.resolve(clientRoot, 'vite.config.ts');
    const { createServer }: typeof import('vite') = await import('vite');

    this.viteServer = await createServer({
      appType: 'custom',
      configFile,
      root: clientRoot,
      server: { middlewareMode: true },
    });

    expressApp.use(this.viteServer.middlewares);
    expressApp.use(async (req, res, next) => {
      if (this.isBackendRoute(req)) {
        next();
        return;
      }

      try {
        let template = await readFile(
          path.resolve(clientRoot, 'index.html'),
          'utf8',
        );
        template = await this.viteServer.transformIndexHtml(
          req.originalUrl,
          template,
        );
        res.status(200).type('html').send(template);
      } catch (error) {
        this.viteServer.ssrFixStacktrace(error as Error);
        next(error);
      }
    });

    this.logger.log('Vite dev server started in middleware mode');
  }

  private async applyProductionMiddleware(expressApp: Express): Promise<void> {
    const distClientPath = path.resolve(__dirname, '..', 'client');
    this.productionIndexHtml ??= await readFile(
      path.resolve(distClientPath, 'index.html'),
      'utf8',
    );

    expressApp.use(serveStatic(distClientPath, { index: false }));
    expressApp.use((req, res, next) => {
      if (this.isBackendRoute(req)) {
        next();
        return;
      }

      res.status(200).type('html').send(this.productionIndexHtml);
    });
  }

  private isBackendRoute(request: Request): boolean {
    const requestPath =
      request.originalUrl.split('?')[0] ?? request.originalUrl;
    return requestPath === '/healthz' || requestPath.startsWith('/api');
  }
}
