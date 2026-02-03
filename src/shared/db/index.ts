import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { logger } from '../logger/index.js';
import { UserTable } from '../../modules/users/users.schema.js';
import { CategoryTable } from '../../modules/categories/categories.schema.js';
import { ProductTable } from '../../modules/products/products.schema.js';
import { OrderTable, OrderItemTable } from '../../modules/orders/orders.schema.js';

export interface Database {
  users: UserTable;
  categories: CategoryTable;
  products: ProductTable;
  orders: OrderTable;
  order_items: OrderItemTable;
}

const { Pool } = pg;

// Configuración de la conexión usando variables de entorno
// Nota: Usamos process.env aquí porque este archivo se puede importar
// independientemente del contexto de Fastify.
const dialect = new PostgresDialect({
  pool: new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10, // Máximo 10 conexiones simultáneas (ideal para tu límite de RAM)
  }),
});

export const db = new Kysely<Database>({
  dialect,
  // Hook para loguear errores de SQL automáticamente
  log(event) {
    if (event.level === 'error') {
      logger.error({
        msg: 'Query Error',
        sql: event.query.sql,
        params: event.query.parameters,
        error: event.error,
      });
    }
  },
});