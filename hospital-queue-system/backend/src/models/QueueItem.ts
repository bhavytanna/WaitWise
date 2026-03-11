import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export type QueueStatus = 'waiting' | 'called' | 'in_consultation' | 'done';
export type QueuePriority = 'normal' | 'emergency';

const QueueItemSchema = new Schema(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
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
      enum: ['waiting', 'called', 'in_consultation', 'done'],
      default: 'waiting',
      index: true,
    },
  },
  { timestamps: true },
);

QueueItemSchema.index({ doctorId: 1, priority: 1, createdAt: 1 });

export type QueueItem = InferSchemaType<typeof QueueItemSchema>;
export const QueueItemModel = mongoose.model('QueueItem', QueueItemSchema);
