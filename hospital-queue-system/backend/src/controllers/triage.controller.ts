import type { RequestHandler } from 'express';
import { updatePatientPrioritySchema } from '../validation/schemas.js';
import { listActivePatientsForDoctor, setPatientPriority } from '../services/patient/triageService.js';

export const setPatientPriorityHandler: RequestHandler = async (req, res, next) => {
  try {
    const patientId = String(req.params.id);
    const parsed = updatePatientPrioritySchema.parse(req.body);
    const data = await setPatientPriority(patientId, parsed.priority);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const listDoctorActivePatientsHandler: RequestHandler = async (req, res, next) => {
  try {
    const doctorId = String(req.params.doctorId);
    const data = await listActivePatientsForDoctor(doctorId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
