import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';
import { DoctorModel } from '../../models/Doctor.js';
import { UserModel } from '../../models/User.js';
import { AppError } from '../errors/AppError.js';

export async function listDoctors() {
  const docs = await DoctorModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    department: d.department,
    departmentCode: d.departmentCode,
    avgConsultTime: d.avgConsultTime,
    createdAt: d.createdAt,
  }));
}

export async function addDoctor(input: {
  name: string;
  department: string;
  departmentCode: string;
  avgConsultTime: number;
  username: string;
  password?: string;
}) {
  const departmentCode = input.departmentCode.toUpperCase().trim();

  // Check if username already exists
  const existingUser = await UserModel.findOne({ username: input.username });
  if (existingUser) {
    throw new AppError('Username already exists', StatusCodes.BAD_REQUEST);
  }

  const doctor = await DoctorModel.create({
    name: input.name,
    department: input.department,
    departmentCode,
    avgConsultTime: input.avgConsultTime,
  });

  // Create login credentials for the doctor
  const defaultPassword = input.password || 'password123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  await UserModel.create({
    username: input.username,
    passwordHash,
    role: 'doctor',
    doctorId: doctor._id,
  });

  return {
    id: doctor._id.toString(),
    name: doctor.name,
    department: doctor.department,
    departmentCode: doctor.departmentCode,
    avgConsultTime: doctor.avgConsultTime,
    username: input.username,
  };
}

export async function deleteDoctor(id: string) {
  const doctor = await DoctorModel.findByIdAndDelete(id);
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }
  return { id: doctor._id.toString() };
}

export async function updateDoctorConsultTime(id: string, avgConsultTime: number) {
  const doctor = await DoctorModel.findById(id);
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  doctor.avgConsultTime = avgConsultTime;
  await doctor.save();

  return {
    id: doctor._id.toString(),
    avgConsultTime: doctor.avgConsultTime,
  };
}
