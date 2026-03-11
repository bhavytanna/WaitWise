import type { RequestHandler } from 'express';
import { patientRegisterSchema } from '../validation/schemas.js';
import { registerPatient } from '../services/patient/patientService.js';

export const registerPatientHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = patientRegisterSchema.parse(req.body);
    const data = await registerPatient(parsed);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
