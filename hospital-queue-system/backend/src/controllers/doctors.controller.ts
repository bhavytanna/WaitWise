import type { RequestHandler } from 'express';
import { addDoctorSchema, updateConsultTimeSchema } from '../validation/schemas.js';
import { addDoctor, deleteDoctor, listDoctors, updateDoctorConsultTime } from '../services/doctors/doctorService.js';

export const listDoctorsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const data = await listDoctors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const addDoctorHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = addDoctorSchema.parse(req.body);
    const data = await addDoctor(parsed);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteDoctorHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const data = await deleteDoctor(id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const updateConsultTimeHandler: RequestHandler = async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const parsed = updateConsultTimeSchema.parse(req.body);
    const data = await updateDoctorConsultTime(id, parsed.avgConsultTime);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
