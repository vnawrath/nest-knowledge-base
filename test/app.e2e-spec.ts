import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-test-app';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/healthz (GET) returns ok', () => {
    return request(app.getHttpServer())
      .get('/healthz')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('unknown route returns 404 with consistent error shape', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/non-existent')
      .expect(404);

    const body = res.body as Record<string, unknown>;
    expect(body).toMatchObject({
      statusCode: 404,
      path: '/api/non-existent',
    });
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('timestamp');
  });
});
