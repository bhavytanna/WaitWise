const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is required in production.');
  }
  return secret ?? 'dev-secret-change-me';
};

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/hospital_queue',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
  jwtSecret: getJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
};
