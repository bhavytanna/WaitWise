import { StatusCodes } from 'http-status-codes';

import { PatientModel } from '../../models/Patient.js';
import { QueueItemModel } from '../../models/QueueItem.js';
import { AppError } from '../errors/AppError.js';
import { getQueueForDoctor } from '../queue/queueService.js';
import { getIo } from '../realtime/io.js';

export async function setPatientPriority(patientId: string, priority: 'normal' | 'emergency') {
  const patient = await PatientModel.findById(patientId);
  if (!patient) {
    throw new AppError('Patient not found', StatusCodes.NOT_FOUND);
  }

  patient.priority = priority;
  await patient.save();

  await QueueItemModel.updateMany(
    { patientId: patient._id, status: { $in: ['waiting', 'called', 'in_consultation'] } },
    { $set: { priority } },
  );

  const doctorId = patient.doctorId.toString();
  const queue = await getQueueForDoctor(doctorId);

  const io = getIo();
  io.to(`doctor:${doctorId}`).emit('queue:update', queue);
  io.emit('queue:updateGlobal', { doctorId, queue });

  return { patientId: patient._id.toString(), doctorId, priority };
}

export async function listActivePatientsForDoctor(doctorId: string) {
  const patients = await PatientModel.find({ doctorId, status: { $in: ['waiting', 'in_consultation'] } })
    .sort({ priority: 1, arrivalTime: 1 })
    .lean();

  return patients.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    age: p.age,
    phone: p.phone,
    tokenNumber: p.tokenNumber,
    status: p.status,
    priority: p.priority,
    arrivalTime: p.arrivalTime,
  }));
}
