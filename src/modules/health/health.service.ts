import { sql } from 'kysely';
import { db } from '../../shared/db/index.js';

export class HealthService {
  async checkDatabase(): Promise<boolean> {
    try {
      // Ejecutamos una query trivial para ver si la DB está viva
      await sql`SELECT 1`.execute(db);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getSystemStatus() {
    const dbStatus = await this.checkDatabase();
    
    return {
      service: 'commerce-core',
      version: '0.1.0',
      status: dbStatus ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbStatus ? 'up' : 'down'
      }
    };
  }
}

// Exportamos una instancia única (Singleton) para ahorrar memoria
export const healthService = new HealthService();