import type { RequestHandler } from 'express';
import { getStats } from '../services/admin/statsService.js';
import { StatusCodes } from 'http-status-codes';
import { DoctorModel } from '../models/Doctor.js';
import { PatientModel } from '../models/Patient.js';
import { QueueItemModel } from '../models/QueueItem.js';
import { CounterModel } from '../models/Counter.js';
import { UserModel } from '../models/User.js';

export const getStatsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const wipeAllDataHandler: RequestHandler = async (req, res, next) => {
  try {
    const allowInProd = String(process.env.ALLOW_ADMIN_WIPE ?? '').toLowerCase() === 'true';
    if (process.env.NODE_ENV === 'production' && !allowInProd) {
      return next({
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Wipe is disabled in production. Set ALLOW_ADMIN_WIPE=true to enable.',
      });
    }

    const confirm = String((req.body as any)?.confirm ?? '');
    if (confirm !== 'WIPE_ALL_DATA') {
      return next({ statusCode: StatusCodes.BAD_REQUEST, message: 'Invalid confirmation value.' });
    }

    const [doctors, patients, queueItems, counters, doctorUsers] = await Promise.all([
      DoctorModel.deleteMany({}),
      PatientModel.deleteMany({}),
      QueueItemModel.deleteMany({}),
      CounterModel.deleteMany({}),
      UserModel.deleteMany({ role: 'doctor' }),
    ]);

    return res.json({
      success: true,
      data: {
        doctorsDeleted: doctors.deletedCount ?? 0,
        patientsDeleted: patients.deletedCount ?? 0,
        queueItemsDeleted: queueItems.deletedCount ?? 0,
        countersDeleted: counters.deletedCount ?? 0,
        doctorUsersDeleted: doctorUsers.deletedCount ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
