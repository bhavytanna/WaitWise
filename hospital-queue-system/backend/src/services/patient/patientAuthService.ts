import { StatusCodes } from 'http-status-codes';

import { PatientModel } from '../../models/Patient.js';
import { AppError } from '../errors/AppError.js';
import { signJwt } from '../auth/jwt.js';

export async function patientLogin(input: { patientId: string; phone: string }) {
  const patient = await PatientModel.findById(input.patientId).lean();
  if (!patient) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  if (String(patient.phone).trim() !== String(input.phone).trim()) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const token = signJwt({ sub: patient._id.toString(), role: 'patient' });

  return {
    token,
    user: {
      id: patient._id.toString(),
      username: patient.tokenNumber,
      role: 'patient' as const,
    },
  };
}
