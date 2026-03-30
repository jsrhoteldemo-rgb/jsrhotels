// api/index.js – Vercel Serverless Function entry point
// Wraps the entire Express app as a single serverless function.

import express from 'express';
import cors from 'cors';
import { requireAuth } from '../server/src/middleware/auth.js';
import { errorHandler, notFoundHandler } from '../server/src/middleware/errorHandler.js';
import authRoutes from '../server/src/routes/authRoutes.js';
import publicRoutes from '../server/src/routes/publicRoutes.js';
import adminRoutes from '../server/src/routes/adminRoutes.js';
import uploadRoutes from '../server/src/routes/uploadRoutes.js';

const app = express();

const clientOrigin = process.env.CLIENT_ORIGIN || 'https://jsrhotels.vercel.app';
const configuredOrigins = new Set(
  String(clientOrigin)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) { callback(null, true); return; }
      if (configuredOrigins.has(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true); return;
      }
      callback(new Error(`Origin ${origin} not allowed`));
    },
  }),
);

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({
  ok: true,
  env: {
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'not set',
  }
}));

app.use('/api/public', publicRoutes);
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/uploads', requireAuth, uploadRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
