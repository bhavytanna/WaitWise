import type { RequestHandler } from 'express';
import { getPatientStatus } from '../services/queue/queueService.js';
import { StatusCodes } from 'http-status-codes';

export const getPatientStatusHandler: RequestHandler = async (req, res, next) => {
  try {
    const requestedId = req.params.id ? String(req.params.id) : String(req.auth?.userId ?? '');
    if (!requestedId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Patient ID missing' });
    }

    const data = await getPatientStatus(requestedId);
    
    // IDOR Protection: Strip PII if the requester is not an admin/doctor and not the exact patient
    const isAuthorized = req.auth?.role === 'admin' || req.auth?.role === 'doctor' || req.auth?.userId === requestedId;
    
    if (!isAuthorized && data.patient) {
      // Create a masked version of the patient data
      data.patient = {
        ...data.patient,
        name: data.patient.name.charAt(0) + '***',
        phone: '***-***-' + data.patient.phone.slice(-4),
        age: 0, // hide age
      };
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
