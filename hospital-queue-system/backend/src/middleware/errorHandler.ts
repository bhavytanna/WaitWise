import type { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';

import { AppError } from '../services/errors/AppError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err && typeof err === 'object' && 'statusCode' in err && 'message' in err) {
    const e = err as { statusCode: number; message: string; details?: unknown };
    return res.status(e.statusCode).json({
      success: false,
      message: e.message,
      details: e.details,
    });
  }

  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid input',
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // eslint-disable-next-line no-console
  console.error(err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
  });
};
