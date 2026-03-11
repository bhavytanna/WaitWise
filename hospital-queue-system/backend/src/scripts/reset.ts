import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { env } from '../config/env.js';
import { DoctorModel } from '../models/Doctor.js';
import { PatientModel } from '../models/Patient.js';
import { QueueItemModel } from '../models/QueueItem.js';
import { CounterModel } from '../models/Counter.js';
import { UserModel } from '../models/User.js';

async function reset() {
  await mongoose.connect(env.mongoUri);

  await Promise.all([
    DoctorModel.deleteMany({}),
    PatientModel.deleteMany({}),
    QueueItemModel.deleteMany({}),
    CounterModel.deleteMany({}),
    UserModel.deleteMany({ role: 'doctor' }),
  ]);

  const adminExists = await UserModel.findOne({ role: 'admin' }).select({ _id: 1 }).lean();
  if (!adminExists) {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await UserModel.create({ username: 'admin', passwordHash: adminPasswordHash, role: 'admin' });
  }

  // eslint-disable-next-line no-console
  console.log('DB reset complete');
  // eslint-disable-next-line no-console
  console.log('Admin login: admin / admin123');

  await mongoose.disconnect();
}

reset().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
