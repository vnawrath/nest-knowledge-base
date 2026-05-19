import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-test-app';

interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

function parseUserResponse(body: unknown): UserResponse {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Expected user response body to be an object');
  }

  const candidate = body as Record<string, unknown>;

  if (
    typeof candidate.id !== 'number' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.email !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  ) {
    throw new Error('Expected user response body to include CRUD fields');
  }

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports CRUD via /api/users', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      })
      .expect(201);

    const createdUser = parseUserResponse(createResponse.body as unknown);

    expect(createdUser.id).toEqual(expect.any(Number));
    expect(createdUser.name).toBe('Ada Lovelace');
    expect(createdUser.email).toBe('ada@example.com');
    expect(createdUser.createdAt).toEqual(expect.any(String));
    expect(createdUser.updatedAt).toEqual(expect.any(String));

    const userId = createdUser.id;

    const listResponse = await request(app.getHttpServer())
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect((listResponse.body as unknown[]).map(parseUserResponse)).toEqual([
      expect.objectContaining({
        id: userId,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    ]);

    const getResponse = await request(app.getHttpServer())
      .get(`/api/users/${userId}`)
      .expect(200);

    expect(parseUserResponse(getResponse.body as unknown)).toEqual(
      expect.objectContaining({
        id: userId,
        name: 'Ada Lovelace',
        email: 'ada@example.com',
      }),
    );

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/users/${userId}`)
      .send({ name: 'Ada Byron' })
      .expect(200);

    expect(parseUserResponse(updateResponse.body as unknown)).toEqual(
      expect.objectContaining({
        id: userId,
        name: 'Ada Byron',
        email: 'ada@example.com',
      }),
    );

    await request(app.getHttpServer())
      .post('/api/users')
      .send({
        name: 'Duplicate Ada',
        email: 'ada@example.com',
      })
      .expect(409);

    await request(app.getHttpServer())
      .delete(`/api/users/${userId}`)
      .expect(204);

    await request(app.getHttpServer()).get(`/api/users/${userId}`).expect(404);
  });
});
