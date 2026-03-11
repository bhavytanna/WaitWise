import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export type UserRole = 'doctor' | 'admin';

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['doctor', 'admin'], index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: false },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof UserSchema>;
export const UserModel = mongoose.model('User', UserSchema);
