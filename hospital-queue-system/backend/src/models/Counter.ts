import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const CounterSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export type Counter = InferSchemaType<typeof CounterSchema>;
export const CounterModel = mongoose.model('Counter', CounterSchema);
