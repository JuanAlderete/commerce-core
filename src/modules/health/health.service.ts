import { db } from '../../shared/db';
import { logger } from '../../shared/logger';

export class HealthService {
  async check() {
    try {
      await db.query('SELECT 1');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      logger.error(error, 'Health check failed');
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
      };
    }
  }
}

export const healthService = new HealthService();
