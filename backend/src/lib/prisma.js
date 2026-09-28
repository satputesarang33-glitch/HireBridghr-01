import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// Global singleton instance for Prisma Client in development to prevent connection exhaustion
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Health check helper to verify database connectivity
 */
export const checkDatabaseConnection = async () => {
  try {
    if (!env.DATABASE_URL) {
      return {
        connected: false,
        message: 'DATABASE_URL is not set in backend/.env. Please configure your PostgreSQL connection string.',
      };
    }
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'PostgreSQL database connected successfully via Prisma.' };
  } catch (error) {
    logger.error('Database connection check failed', error);
    return { connected: false, message: error.message };
  }
};
