import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const DoctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    departmentCode: { type: String, required: true, trim: true, uppercase: true },
    avgConsultTime: { type: Number, required: true, min: 1 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } },
);

DoctorSchema.index({ departmentCode: 1 });

export type Doctor = InferSchemaType<typeof DoctorSchema>;
export const DoctorModel = mongoose.model('Doctor', DoctorSchema);
