import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const configuredJwtSecret = process.env.JWT_SECRET?.trim();

if (
  isProduction &&
  (!configuredJwtSecret ||
    configuredJwtSecret === 'change-me-in-production' ||
    configuredJwtSecret.length < 16)
) {
  throw new Error('JWT_SECRET must be set to a strong value in production.');
}

export const env = {
  port: Number(process.env.API_PORT || 4000),
  jwtSecret: configuredJwtSecret || 'change-me-in-production',
  clientOrigin:
    process.env.CLIENT_ORIGIN ||
    'http://localhost:5173,http://localhost:5174,http://localhost:5175',
  uploadsDir: process.env.UPLOADS_DIR || 'server/uploads',
};
