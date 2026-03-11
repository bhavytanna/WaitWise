import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { attachIo } from './services/realtime/io.js';
import { env } from './config/env.js';

const app = express();

/* ---------------- ERROR HANDLING ---------------- */

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception', err);
});

/* ---------------- SECURITY ---------------- */

app.use(helmet());

/* ---------------- CORS ---------------- */

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (process.env.NODE_ENV !== 'production') {
      return cb(null, true);
    }

    if (!origin) {
      return cb(null, false);
    }

    const allowed = env.corsOrigin;

    if (allowed.includes(origin)) {
      return cb(null, true);
    }

    return cb(null, false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

/* ---------------- RATE LIMIT ---------------- */

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 600),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
    });
  },
});

/* ---------------- HEALTH ROUTES ---------------- */

app.get('/', (_req, res) => {
  res.send('WaitWise API running 🚀');
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

/* ---------------- API ROUTES ---------------- */

if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}

app.use('/api', apiRouter);

/* ---------------- ERROR MIDDLEWARE ---------------- */

app.use(notFoundHandler);
app.use(errorHandler);

/* ---------------- SERVER + SOCKET ---------------- */

const server = http.createServer(app);

server.on('error', (err) => {
  console.error('HTTP server error', err);
});

const io = new SocketIOServer(server, {
  cors: {
    origin:
      process.env.NODE_ENV !== 'production'
        ? true
        : (origin, cb) => {
            if (!origin) return cb(null, false);
            return cb(null, env.corsOrigin.includes(origin));
          },
    credentials: true,
  },
});

attachIo(io);

/* ---------------- DATABASE + START SERVER ---------------- */

async function start() {
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error', err);
  });

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected', {
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  });

  mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected');
  });

  await mongoose.connect(env.mongoUri);

  const PORT = process.env.PORT || env.port;

  server.listen(PORT, () => {
    console.log(`Backend listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

export default app;