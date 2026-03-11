import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginHandler } from '../controllers/auth.controller.js';

export const authRouter = Router();

// Strict rate limit for login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: Number(process.env.LOGIN_RATE_LIMIT ?? 10), // Limit each IP to 10 login requests per `window`
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

authRouter.post('/login', loginLimiter, loginHandler);
