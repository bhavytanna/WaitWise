import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyJwt } from '../services/auth/jwt.js';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: 'doctor' | 'admin' | 'patient';
        doctorId?: string;
      };
    }
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next({ statusCode: StatusCodes.UNAUTHORIZED, message: 'Unauthorized' });
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = verifyJwt(token);
    req.auth = { userId: payload.sub, role: payload.role, doctorId: payload.doctorId };
    return next();
  } catch {
    return next({ statusCode: StatusCodes.UNAUTHORIZED, message: 'Unauthorized' });
  }
};

export function requireRole(role: 'doctor' | 'admin' | 'patient'): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth) {
      return next({ statusCode: StatusCodes.UNAUTHORIZED, message: 'Unauthorized' });
    }
    if (req.auth.role !== role) {
      return next({ statusCode: StatusCodes.FORBIDDEN, message: 'Forbidden' });
    }
    return next();
  };
}
