import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { DoctorModel } from '../../models/Doctor.js';
import { PatientModel } from '../../models/Patient.js';
import { QueueItemModel } from '../../models/QueueItem.js';
import { AppError } from '../errors/AppError.js';
import { getIo } from '../realtime/io.js';
import { estimateWaitTimeMinutes } from './waitTime.js';

export async function getQueueForDoctor(doctorId: string) {
  const [doctor, items] = await Promise.all([
    DoctorModel.findById(doctorId),
    QueueItemModel.find({ doctorId }).sort({ priority: 1, createdAt: 1 }).lean(),
  ]);

  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  const waiting = items.filter((x) => x.status === 'waiting' || x.status === 'called');
  const current = items.find((x) => x.status === 'in_consultation') ?? null;
  const next = waiting[0] ?? null;

  return {
    doctor: {
      id: doctor.id,
      name: doctor.name,
      department: doctor.department,
      departmentCode: doctor.departmentCode,
      avgConsultTime: doctor.avgConsultTime,
    },
    current,
    next,
    queue: items,
  };
}

export async function callNextPatient(doctorId: string) {
  const next = await QueueItemModel.findOne({ doctorId, status: 'waiting' }).sort({ priority: 1, createdAt: 1 });

  if (next) {
    next.status = 'called';
    await next.save();
  }

  const queue = await getQueueForDoctor(doctorId);

  const io = getIo();
  io.to(`doctor:${doctorId}`).emit('queue:update', queue);
  io.emit('queue:updateGlobal', { doctorId, queue });

  return queue;
}

export async function moveToNextPatient(doctorId: string) {
  async function moveWithoutTransaction() {
    const current = await QueueItemModel.findOne({ doctorId, status: 'in_consultation' });
    if (current) {
      current.status = 'done';
      await current.save();
      await PatientModel.findByIdAndUpdate(current.patientId, { status: 'done' });
    }

    const next = await QueueItemModel.findOne({ doctorId, status: { $in: ['waiting', 'called'] } }).sort({
      priority: 1,
      createdAt: 1,
    });
    if (next) {
      next.status = 'in_consultation';
      await next.save();
      await PatientModel.findByIdAndUpdate(next.patientId, { status: 'in_consultation' });
    }

    const queue = await getQueueForDoctor(doctorId);

    const io = getIo();
    io.to(`doctor:${doctorId}`).emit('queue:update', queue);
    io.emit('queue:updateGlobal', { doctorId, queue });

    return queue;
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await QueueItemModel.findOne({ doctorId, status: 'in_consultation' }).session(session);
      if (current) {
        current.status = 'done';
        await current.save({ session });
        await PatientModel.findByIdAndUpdate(current.patientId, { status: 'done' }).session(session);
      }

      const next = await QueueItemModel.findOne({ doctorId, status: { $in: ['waiting', 'called'] } })
        .sort({ priority: 1, createdAt: 1 })
        .session(session);

      if (next) {
        next.status = 'in_consultation';
        await next.save({ session });
        await PatientModel.findByIdAndUpdate(next.patientId, { status: 'in_consultation' }).session(session);
      }
    });

    const queue = await getQueueForDoctor(doctorId);

    const io = getIo();
    io.to(`doctor:${doctorId}`).emit('queue:update', queue);
    io.emit('queue:updateGlobal', { doctorId, queue });

    return queue;
  } catch (err: any) {
    const codeName = err?.codeName;
    const message = String(err?.message ?? '');
    if (codeName === 'IllegalOperation' || message.includes('Transaction numbers are only allowed')) {
      return moveWithoutTransaction();
    }
    throw err;
  } finally {
    session.endSession();
  }
}

export async function getPatientStatus(patientId: string) {
  const patient = await PatientModel.findById(patientId).lean();
  if (!patient) {
    throw new AppError('Patient not found', StatusCodes.NOT_FOUND);
  }

  const priority = (patient as any).priority === 'emergency' ? 'emergency' : 'normal';

  const doctor = await DoctorModel.findById(patient.doctorId).lean();
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  const ahead =
    priority === 'emergency'
      ? await QueueItemModel.countDocuments({
          doctorId: patient.doctorId,
          status: { $in: ['waiting', 'called'] },
          priority: 'emergency',
          createdAt: { $lt: patient.createdAt },
        })
      : await QueueItemModel.countDocuments({
          doctorId: patient.doctorId,
          status: { $in: ['waiting', 'called'] },
          $or: [
            { priority: 'emergency' },
            { priority: 'normal', createdAt: { $lt: patient.createdAt } },
          ],
        });

  const estimatedWaitTimeMinutes = estimateWaitTimeMinutes(ahead, doctor.avgConsultTime);

  return {
    patient: {
      id: patient._id.toString(),
      name: patient.name,
      age: patient.age,
      phone: patient.phone,
      tokenNumber: patient.tokenNumber,
      priority,
      status: patient.status,
      arrivalTime: patient.arrivalTime,
    },
    doctor: {
      id: doctor._id.toString(),
      name: doctor.name,
      department: doctor.department,
      avgConsultTime: doctor.avgConsultTime,
    },
    patientsAhead: ahead,
    estimatedWaitTimeMinutes,
  };
}
