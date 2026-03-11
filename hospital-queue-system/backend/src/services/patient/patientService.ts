import { StatusCodes } from 'http-status-codes';

import { DoctorModel } from '../../models/Doctor.js';
import { PatientModel } from '../../models/Patient.js';
import { QueueItemModel } from '../../models/QueueItem.js';
import { AppError } from '../errors/AppError.js';
import { getIo } from '../realtime/io.js';
import { nextTokenForDepartment } from '../tokens/tokenService.js';
import { estimateWaitTimeMinutes } from '../queue/waitTime.js';

export async function registerPatient(input: {
  name: string;
  age: number;
  phone: string;
  doctorId: string;
}) {
  const phone = input.phone.trim();

  const doctor = await DoctorModel.findById(input.doctorId);
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  const existing = await PatientModel.findOne({ phone, status: { $ne: 'done' } }).select({ _id: 1 }).lean();
  if (existing) {
    throw new AppError('This phone number already has an active token', StatusCodes.CONFLICT);
  }

  const tokenNumber = await nextTokenForDepartment(doctor.departmentCode);

  const patient = await PatientModel.create({
    name: input.name,
    age: input.age,
    phone,
    doctorId: doctor._id,
    tokenNumber,
    priority: 'normal',
    status: 'waiting',
    arrivalTime: new Date(),
  });

  await QueueItemModel.create({
    doctorId: doctor._id,
    patientId: patient._id,
    tokenNumber,
    priority: 'normal',
    status: 'waiting',
  });

  const patientsAhead = await QueueItemModel.countDocuments({
    doctorId: doctor._id,
    status: { $in: ['waiting', 'called'] },
    createdAt: { $lt: patient.createdAt },
  });

  const estimatedWaitTimeMinutes = estimateWaitTimeMinutes(patientsAhead, doctor.avgConsultTime);

  const io = getIo();
  io.to(`doctor:${doctor._id.toString()}`).emit('patient:registered', {
    doctorId: doctor._id.toString(),
    patientId: patient._id.toString(),
  });
  io.emit('queue:changed', { doctorId: doctor._id.toString() });

  return {
    patientId: patient._id.toString(),
    tokenNumber,
    doctorName: doctor.name,
    patientsAhead,
    estimatedWaitTimeMinutes,
  };
}
