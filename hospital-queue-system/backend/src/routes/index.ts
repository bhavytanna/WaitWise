import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { adminRouter } from './admin.routes.js';
import { doctorsRouter } from './doctors.routes.js';
import { patientRouter } from './patient.routes.js';
import { queueRouter } from './queue.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/doctors', doctorsRouter);
apiRouter.use('/patient', patientRouter);
apiRouter.use('/queue', queueRouter);
