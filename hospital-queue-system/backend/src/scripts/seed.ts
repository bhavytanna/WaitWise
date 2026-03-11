import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { DoctorModel } from '../models/Doctor.js';
import { PatientModel } from '../models/Patient.js';
import { QueueItemModel } from '../models/QueueItem.js';
import { CounterModel } from '../models/Counter.js';
import { UserModel } from '../models/User.js';
import { nextTokenForDepartment } from '../services/tokens/tokenService.js';

async function seed() {
  await mongoose.connect(env.mongoUri);

  await Promise.all([
    DoctorModel.deleteMany({}),
    PatientModel.deleteMany({}),
    QueueItemModel.deleteMany({}),
    CounterModel.deleteMany({}),
    UserModel.deleteMany({}),
  ]);

  const doctors = await DoctorModel.insertMany([
    { name: 'Dr. Anika Shah', department: 'Cardiology', departmentCode: 'C', avgConsultTime: 8 },
    { name: 'Dr. Rahul Mehta', department: 'Orthopedics', departmentCode: 'O', avgConsultTime: 10 },
    { name: 'Dr. Sana Khan', department: 'Pediatrics', departmentCode: 'P', avgConsultTime: 7 },
    { name: 'Dr. Vikram Rao', department: 'Neurology', departmentCode: 'N', avgConsultTime: 12 },
    { name: 'Dr. Neha Iyer', department: 'General', departmentCode: 'G', avgConsultTime: 6 },
  ]);

  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await UserModel.create({ username: 'admin', passwordHash: adminPasswordHash, role: 'admin' });

  for (const d of doctors) {
    const pass = await bcrypt.hash('doctor123', 10);
    await UserModel.create({ username: d.departmentCode.toLowerCase(), passwordHash: pass, role: 'doctor', doctorId: d._id });
  }

  const doctor0 = doctors[0]!;

  for (let i = 0; i < 20; i++) {
    const tokenNumber = await nextTokenForDepartment(doctor0.departmentCode);

    const patient = await PatientModel.create({
      name: `Patient ${i + 1}`,
      age: 20 + (i % 30),
      phone: `999000${String(i).padStart(4, '0')}`,
      doctorId: doctor0._id,
      tokenNumber,
      status: 'waiting',
      arrivalTime: new Date(),
    });

    await QueueItemModel.create({
      doctorId: doctor0._id,
      patientId: patient._id,
      tokenNumber,
      status: 'waiting',
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed complete');
  // eslint-disable-next-line no-console
  console.log('Admin login: admin / admin123');
  // eslint-disable-next-line no-console
  console.log('Doctor logins: c, o, p, n, g / doctor123');

  await mongoose.disconnect();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
