import pg from 'pg';
import { config } from '../config';
import { logger } from '../logger';

const { Pool } = pg;

const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// Listener for unexpected errors on idle clients
pool.on('error', (err, client) => {
  logger.error(err, 'Unexpected error on idle client');
  process.exit(-1);
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  pool,
};
