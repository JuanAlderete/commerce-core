import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('categories')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('slug', 'varchar', (col) => col.notNull().unique())
        .addColumn('description', 'text')
        .addColumn('parent_id', 'uuid', (col) =>
            col.references('categories.id').onDelete('set null')
        )
        .addColumn('created_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull()
        )
        .addColumn('updated_at', 'timestamp', (col) =>
            col.defaultTo(sql`now()`).notNull()
        )
        .execute();

    await db.schema
        .createIndex('categories_slug_index')
        .on('categories')
        .column('slug')
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('categories').execute();
}