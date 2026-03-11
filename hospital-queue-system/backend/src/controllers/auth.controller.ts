import type { RequestHandler } from 'express';
import { loginSchema } from '../validation/schemas.js';
import { login } from '../services/auth/authService.js';

export const loginHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const data = await login(parsed);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
