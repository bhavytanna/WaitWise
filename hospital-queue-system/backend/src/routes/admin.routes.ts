import { Router } from 'express';
import { getStatsHandler } from '../controllers/admin.controller.js';
import { listDoctorActivePatientsHandler, setPatientPriorityHandler } from '../controllers/triage.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const adminRouter = Router();

adminRouter.get('/stats', requireAuth, requireRole('admin'), getStatsHandler);
adminRouter.get('/triage/:doctorId/patients', requireAuth, requireRole('admin'), listDoctorActivePatientsHandler);
adminRouter.patch('/triage/patient/:id/priority', requireAuth, requireRole('admin'), setPatientPriorityHandler);
