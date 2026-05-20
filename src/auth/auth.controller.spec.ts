import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants';
import { Role } from './role.constant';

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    me: jest.fn(),
    clearRefreshCookie: jest.fn(),
  };

  const controller = new AuthController(authService as unknown as AuthService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates register to the auth service', async () => {
    const dto = {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'password123',
    };
    const response = {} as never;

    await controller.register(dto, response);

    expect(authService.register).toHaveBeenCalledWith(dto, response);
  });

  it('delegates login to the auth service', async () => {
    const dto = { email: 'ada@example.com', password: 'password123' };
    const response = {} as never;

    await controller.login(dto, response);

    expect(authService.login).toHaveBeenCalledWith(dto, response);
  });

  it('throws when the refresh cookie is missing', () => {
    expect(() =>
      controller.refresh({ cookies: {} } as never, {} as never),
    ).toThrow(UnauthorizedException);
  });

  it('delegates refresh to the auth service when the cookie is present', async () => {
    const response = {} as never;

    await controller.refresh(
      { cookies: { [REFRESH_TOKEN_COOKIE_NAME]: 'refresh-token' } } as never,
      response,
    );

    expect(authService.refresh).toHaveBeenCalledWith('refresh-token', response);
  });

  it('delegates logout using the session id from the access token', async () => {
    const user = {
      sub: 'user-id',
      sid: 'session-id',
      email: 'ada@example.com',
      roles: [Role.User],
      typ: 'access' as const,
    };
    const response = {} as never;

    await controller.logout(user, response);

    expect(authService.logout).toHaveBeenCalledWith('user-id', 'session-id');
    expect(authService.clearRefreshCookie).toHaveBeenCalledWith(response);
  });

  it('delegates me to the auth service', async () => {
    const user = {
      sub: 'user-id',
      sid: 'session-id',
      email: 'ada@example.com',
      roles: [Role.Admin],
      typ: 'access' as const,
    };

    await controller.me(user);

    expect(authService.me).toHaveBeenCalledWith('user-id');
  });
});
