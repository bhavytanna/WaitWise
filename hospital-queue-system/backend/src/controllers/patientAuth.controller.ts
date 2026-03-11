import type { RequestHandler } from 'express';
import { patientLoginSchema } from '../validation/schemas.js';
import { patientLogin } from '../services/patient/patientAuthService.js';

export const patientLoginHandler: RequestHandler = async (req, res, next) => {
  try {
    const parsed = patientLoginSchema.parse(req.body);
    const data = await patientLogin(parsed);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
