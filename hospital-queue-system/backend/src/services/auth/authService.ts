import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

import { UserModel } from '../../models/User.js';
import { AppError } from '../errors/AppError.js';
import { signJwt } from './jwt.js';

export async function login(input: { username: string; password: string }) {
  const user = await UserModel.findOne({ username: input.username });
  if (!user) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
  }

  const token = signJwt({
    sub: user._id.toString(),
    role: user.role,
    doctorId: user.doctorId?.toString(),
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      doctorId: user.doctorId?.toString(),
    },
  };
}
