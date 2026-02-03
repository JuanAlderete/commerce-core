import { buildApp } from '../src/app.js';
import { db } from '../src/shared/db/index.js';
import { sql } from 'kysely';

export async function getTestApp() {
  const app = await buildApp();
  await app.ready();
  return app;
}

export async function clearDatabase() {
  await sql`TRUNCATE TABLE order_items, orders, products, categories, users CASCADE`.execute(db);
}