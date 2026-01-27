import { buildApp } from './app';
import { config } from './shared/config';
import { logger } from './shared/logger';
import { db } from './shared/db';

const app = buildApp();

const start = async () => {
  try {
    await app.listen({ port: config.PORT, host: '0.0.0.0' });
    logger.info(`Server listening on port ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

// Graceful Shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  try {
    await app.close();
    await db.pool.end();
    logger.info('Closed all connections. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error(err, 'Error during shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
