import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('products')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
        )
        .addColumn('name', 'varchar', (col) => col.notNull())
        .addColumn('slug', 'varchar', (col) => col.notNull().unique())
        .addColumn('description', 'text')

        // DINERO: Guardamos centavos (Integers). Ej: 1000 = $10.00
        .addColumn('price_amount', 'integer', (col) => col.notNull())
        // Moneda: Por si vendes en USD y ARS a la vez (ISO 4217)
        .addColumn('currency', 'varchar(3)', (col) => col.defaultTo('USD').notNull())

        .addColumn('stock', 'integer', (col) => col.defaultTo(0).notNull())
        .addColumn('sku', 'varchar', (col) => col.unique().notNull())

        // IMAGEN: Por ahora URL simple. En el futuro, subida a S3/Cloudinary.
        .addColumn('image_url', 'text')

        // RELACIÓN: Un producto pertenece a una categoría
        .addColumn('category_id', 'uuid', (col) =>
            col.references('categories.id').onDelete('set null')
        )

        .addColumn('active', 'boolean', (col) => col.defaultTo(true).notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    // Índices para performance
    await db.schema.createIndex('products_slug_index').on('products').column('slug').execute();
    await db.schema.createIndex('products_category_index').on('products').column('category_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('products').execute();
}