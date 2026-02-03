import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    // Permitimos que password_hash sea NULL para usuarios invitados
    await db.schema
        .alterTable('users')
        .alterColumn('password_hash', (col) => col.dropNotNull())
        .execute();

    // Opcional: Agregar columna 'is_guest' para distinguirlos fácil
    await db.schema
        .alterTable('users')
        .addColumn('is_guest', 'boolean', (col) => col.defaultTo(false))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    // Revertir es peligroso si ya hay guests, pero por formalidad:
    await db.schema
        .alterTable('users')
        .dropColumn('is_guest')
        .execute();
}