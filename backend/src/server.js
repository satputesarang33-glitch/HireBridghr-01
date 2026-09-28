import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma, checkDatabaseConnection } from './lib/prisma.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  logger.info(`🚀 HirebridgeHR Backend Server listening on port ${PORT}`);
  logger.info(`📖 Swagger API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`🩺 Health Check: http://localhost:${PORT}/api/health`);

  // Verify DB connection at launch
  const dbHealth = await checkDatabaseConnection();
  if (dbHealth.connected) {
    logger.info('✅ PostgreSQL connected successfully via Prisma');
  } else {
    logger.warn(`⚠️ Database Notice: ${dbHealth.message}`);
  }
});

// Graceful Shutdown Handlers
const handleShutdown = async (signal) => {
  logger.info(`${signal} signal received. Initiating graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await prisma.$disconnect();
      logger.info('Prisma client disconnected.');
    } catch (e) {
      logger.error('Error disconnecting Prisma during shutdown', e);
    }
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
});

export default server;
