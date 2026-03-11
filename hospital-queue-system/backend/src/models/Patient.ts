import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export type PatientStatus = 'waiting' | 'in_consultation' | 'done';
export type PatientPriority = 'normal' | 'emergency';

const PatientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 120 },
    phone: { type: String, required: true, trim: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    tokenNumber: { type: String, required: true, index: true },
    priority: {
      type: String,
      required: true,
      enum: ['normal', 'emergency'],
      default: 'normal',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['waiting', 'in_consultation', 'done'],
      default: 'waiting',
      index: true,
    },
    arrivalTime: { type: Date, required: true, default: () => new Date(), index: true },
  },
  { timestamps: true },
);

PatientSchema.index({ doctorId: 1, priority: 1, arrivalTime: 1 });
PatientSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['waiting', 'in_consultation'] },
    },
  },
);

export type Patient = InferSchemaType<typeof PatientSchema>;
export const PatientModel = mongoose.model('Patient', PatientSchema);
