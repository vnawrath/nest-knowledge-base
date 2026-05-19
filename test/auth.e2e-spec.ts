import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import request, { type Response as SupertestResponse } from 'supertest';
import { App } from 'supertest/types';
import { Role } from '../src/auth/role.constant';
import { User } from '../src/users/entities/user.entity';
import { createTestApp } from './helpers/create-test-app';

type TokenResponse = {
  accessToken: string;
  expiresIn: number;
};

function parseTokenResponse(body: unknown): TokenResponse {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Expected token response body to be an object');
  }

  const candidate = body as Record<string, unknown>;
  if (
    typeof candidate.accessToken !== 'string' ||
    typeof candidate.expiresIn !== 'number'
  ) {
    throw new Error('Expected accessToken and expiresIn in response body');
  }

  return {
    accessToken: candidate.accessToken,
    expiresIn: candidate.expiresIn,
  };
}

function getRefreshCookie(response: SupertestResponse): string {
  const cookies = response.headers['set-cookie'] as unknown;
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error('Expected Set-Cookie header');
  }

  const cookieStrings = cookies.filter(
    (cookie): cookie is string => typeof cookie === 'string',
  );
  const refreshCookie = cookieStrings.find((cookie) =>
    cookie.startsWith('refreshToken='),
  );
  if (!refreshCookie) {
    throw new Error('Expected refresh token cookie');
  }

  return refreshCookie.split(';', 1)[0];
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeEach(async () => {
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects protected routes without a session and leaves public routes accessible', async () => {
    await request(app.getHttpServer()).get('/healthz').expect(200);
    await request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('supports the full auth lifecycle with refresh rotation and logout', async () => {
    const agent = request.agent(app.getHttpServer());

    const registerResponse = await agent.post('/api/auth/register').send({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });

    expect(registerResponse.status).toBe(201);
    const registeredTokens = parseTokenResponse(
      registerResponse.body as unknown,
    );
    expect(registeredTokens.expiresIn).toBe(900);

    const originalCookieHeader = getRefreshCookie(registerResponse);
    const originalSetCookie = registerResponse.headers['set-cookie'][0];
    expect(originalSetCookie).toContain('HttpOnly');
    expect(originalSetCookie).toContain('SameSite=Strict');
    expect(originalSetCookie).toContain('Path=/api/auth/refresh');
    expect(originalSetCookie).not.toContain('Secure');

    const meResponse = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registeredTokens.accessToken}`)
      .expect(200);

    expect(meResponse.body).toMatchObject({
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      roles: [Role.User],
    });
    expect(meResponse.body).not.toHaveProperty('password');

    const refreshResponse = await agent.post('/api/auth/refresh').expect(200);
    const rotatedTokens = parseTokenResponse(refreshResponse.body as unknown);
    const rotatedCookieHeader = getRefreshCookie(refreshResponse);

    expect(rotatedCookieHeader).not.toBe(originalCookieHeader);

    await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${rotatedTokens.accessToken}`)
      .expect(200);

    await agent
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${rotatedTokens.accessToken}`)
      .expect(204);

    await agent.post('/api/auth/refresh').expect(401);

    const stolenReplay = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', originalCookieHeader)
      .expect(401);

    expect(stolenReplay.body).toMatchObject({ statusCode: 401 });
  });

  it('supports multiple concurrent sessions for the same user', async () => {
    const firstDevice = request.agent(app.getHttpServer());
    const secondDevice = request.agent(app.getHttpServer());

    await firstDevice.post('/api/auth/register').send({
      name: 'Grace Hopper',
      email: 'grace@example.com',
      password: 'password123',
    });

    const firstLogin = await firstDevice.post('/api/auth/login').send({
      email: 'grace@example.com',
      password: 'password123',
    });
    const secondLogin = await secondDevice.post('/api/auth/login').send({
      email: 'grace@example.com',
      password: 'password123',
    });

    const firstTokens = parseTokenResponse(firstLogin.body as unknown);
    const secondTokens = parseTokenResponse(secondLogin.body as unknown);

    await firstDevice
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${firstTokens.accessToken}`)
      .expect(200);
    await secondDevice
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${secondTokens.accessToken}`)
      .expect(200);

    await firstDevice.post('/api/auth/refresh').expect(200);
    await secondDevice.post('/api/auth/refresh').expect(200);
  });

  it('rate limits repeated login attempts', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send({
      name: 'Rate Limited User',
      email: 'ratelimit@example.com',
      password: 'password123',
    });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ratelimit@example.com', password: 'wrong-password' })
        .expect(401);
    }

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'ratelimit@example.com', password: 'wrong-password' })
      .expect(429);
  });

  it('enforces role-based access control for admin-only routes', async () => {
    const userLogin = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Standard User',
        email: 'user@example.com',
        password: 'password123',
      });

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
      })
      .expect(201);

    await dataSource
      .getRepository(User)
      .update({ email: 'admin@example.com' }, { roles: [Role.Admin] });

    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' })
      .expect(200);

    const userTokens = parseTokenResponse(userLogin.body as unknown);
    const adminTokens = parseTokenResponse(adminLogin.body as unknown);

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${userTokens.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${adminTokens.accessToken}`)
      .expect(200);
  });

  it('rejects refresh tokens as bearer tokens and access tokens at the refresh endpoint', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Token Separation User',
        email: 'tokens@example.com',
        password: 'password123',
      });

    const tokens = parseTokenResponse(loginResponse.body as unknown);
    const refreshCookie = getRefreshCookie(loginResponse);
    const refreshToken = refreshCookie.replace(/^refreshToken=/, '');

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .set('Cookie', `refreshToken=${tokens.accessToken}`)
      .expect(401);
  });
});
