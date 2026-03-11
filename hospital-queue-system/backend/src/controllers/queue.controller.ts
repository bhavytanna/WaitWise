import type { RequestHandler } from 'express';
import { queueCallSchema, queueNextSchema } from '../validation/schemas.js';
import { callNextPatient, getQueueForDoctor, moveToNextPatient } from '../services/queue/queueService.js';

export const getQueueHandler: RequestHandler = async (req, res, next) => {
  try {
    const doctorId = String(req.params.doctorId);
    const data = await getQueueForDoctor(doctorId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const nextPatientHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = queueNextSchema.parse(req.body);
    const data = await moveToNextPatient(parsed.doctorId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const callPatientHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = queueCallSchema.parse(req.body);
    const data = await callNextPatient(parsed.doctorId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
