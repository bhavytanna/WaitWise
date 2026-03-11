import { z } from 'zod';

export const patientRegisterSchema = z.object({
  name: z.string().min(2).max(80),
  age: z.number().int().min(0).max(120),
  phone: z.string().min(7).max(20),
  doctorId: z.string().min(1),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

export const patientLoginSchema = z.object({
  patientId: z.string().min(1),
  phone: z.string().min(7).max(20),
});

export const addDoctorSchema = z.object({
  name: z.string().min(2).max(80),
  department: z.string().min(2).max(80),
  departmentCode: z.string().min(1).max(5),
  avgConsultTime: z.number().int().min(1).max(120),
  username: z.string().min(3).max(50),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100).optional(),
});

export const queueNextSchema = z.object({
  doctorId: z.string().min(1),
});

export const queueCallSchema = z.object({
  doctorId: z.string().min(1),
});

export const updateConsultTimeSchema = z.object({
  avgConsultTime: z.number().int().min(1).max(120),
});

export const updatePatientPrioritySchema = z.object({
  priority: z.enum(['normal', 'emergency']),
});
