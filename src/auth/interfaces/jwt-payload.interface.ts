import type { Role } from '../role.constant';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
  sid: string;
  typ: 'access' | 'refresh';
}
