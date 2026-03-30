import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.API_PORT || 4000),
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  uploadsDir: process.env.UPLOADS_DIR || 'server/uploads',
};
