import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('idempotency_keys')
        // La clave es el UUID que manda el cliente
        .addColumn('key', 'varchar', (col) => col.primaryKey())
        // Guardamos la respuesta para devolverla idéntica
        .addColumn('response_status', 'integer', (col) => col.notNull())
        .addColumn('response_body', 'jsonb', (col) => col.notNull())
        // Guardamos la URL y método por auditoría
        .addColumn('request_path', 'varchar', (col) => col.notNull())
        .addColumn('request_params', 'jsonb')

        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('idempotency_keys').execute();
}