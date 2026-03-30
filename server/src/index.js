import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { env } from './config/env.js';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const app = express();

const configuredOrigins = new Set(
  String(env.clientOrigin || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function isLocalDevOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Allow non-browser requests (curl/postman) and same-origin requests.
      if (!origin) {
        callback(null, true);
        return;
      }

      // Allow configured origins and local development origins.
      if (configuredOrigins.has(origin) || isLocalDevOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by Access-Control-Allow-Origin`));
    },
  }),
);
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadsDir)));
app.use('/api/public', publicRoutes);

app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/uploads', requireAuth, uploadRoutes);
app.use('/api/admin', requireAuth, adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API server running on http://localhost:${env.port}`);
});
