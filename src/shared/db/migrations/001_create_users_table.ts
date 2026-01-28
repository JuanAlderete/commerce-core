import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // Creamos la extensión para generar UUIDs si no existe
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);

    await db.schema
        .createTable('users')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
        )
        .addColumn('email', 'varchar', (col) => col.notNull().unique())
        .addColumn('password_hash', 'varchar', (col) => col.notNull())
        .addColumn('full_name', 'varchar', (col) => col.notNull())
        .addColumn('role', 'varchar', (col) => col.notNull().defaultTo('customer'))
        .addColumn('created_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull()
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull()
        )
        .execute();

    // Índice para búsquedas rápidas por email (Login)
    await db.schema
        .createIndex('users_email_index')
        .on('users')
        .column('email')
        .execute();

    await db.schema
        .createIndex('users_full_name_index')
        .on('users')
        .column('full_name')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute();
}