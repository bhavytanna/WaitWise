import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { registerPatientHandler } from '../controllers/patient.controller.js';
import { patientLoginHandler } from '../controllers/patientAuth.controller.js';
import { getPatientStatusHandler } from '../controllers/patientStatus.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const patientRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT ?? 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

patientRouter.post('/register', loginLimiter, registerPatientHandler);
patientRouter.post('/login', loginLimiter, patientLoginHandler);
patientRouter.get('/me', requireAuth, requireRole('patient'), getPatientStatusHandler);
patientRouter.get('/:id', getPatientStatusHandler);
