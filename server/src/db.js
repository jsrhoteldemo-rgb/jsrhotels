import { PrismaClient } from '@prisma/client';

// Prevent multiple Prisma client instances in serverless hot-reload environments
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
