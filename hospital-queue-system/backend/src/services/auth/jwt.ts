import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export type AuthRole = 'doctor' | 'admin' | 'patient';

export type JwtPayload = {
  sub: string;
  role: AuthRole;
  doctorId?: string;
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
