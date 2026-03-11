import { Router } from 'express';
import {
  addDoctorHandler,
  deleteDoctorHandler,
  listDoctorsHandler,
  updateConsultTimeHandler,
} from '../controllers/doctors.controller.js';
import { setPatientPriorityHandler } from '../controllers/triage.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const doctorsRouter = Router();

doctorsRouter.get('/', listDoctorsHandler);
doctorsRouter.post('/', requireAuth, requireRole('admin'), addDoctorHandler);
doctorsRouter.delete('/:id', requireAuth, requireRole('admin'), deleteDoctorHandler);
doctorsRouter.patch('/:id/consult-time', requireAuth, requireRole('admin'), updateConsultTimeHandler);
doctorsRouter.patch('/patient/:id/priority', requireAuth, requireRole('doctor'), setPatientPriorityHandler);
