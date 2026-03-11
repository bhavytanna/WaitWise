import { Router } from 'express';
import { callPatientHandler, getQueueHandler, nextPatientHandler } from '../controllers/queue.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const queueRouter = Router();

queueRouter.get('/:doctorId', getQueueHandler);
queueRouter.post('/next', requireAuth, requireRole('doctor'), nextPatientHandler);
queueRouter.post('/call', requireAuth, requireRole('doctor'), callPatientHandler);
