import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('orders')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
        )
        .addColumn('user_id', 'uuid', (col) =>
            col.references('users.id').onDelete('restrict').notNull()
        )
        .addColumn('status', 'varchar', (col) =>
            col.defaultTo('pending').notNull()
        )
        .addColumn('total_amount', 'integer', (col) => col.notNull())
        .addColumn('currency', 'varchar(3)', (col) => col.defaultTo('USD').notNull())
        .addColumn('created_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.defaultTo(sql`now()`).notNull())
        .execute();

    await db.schema
        .createTable('order_items')
        .addColumn('id', 'uuid', (col) =>
            col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
        )
        .addColumn('order_id', 'uuid', (col) =>
            col.references('orders.id').onDelete('cascade').notNull()
        )
        .addColumn('product_id', 'uuid', (col) =>
            col.references('products.id').onDelete('restrict').notNull()
        )
        .addColumn('quantity', 'integer', (col) => col.notNull())
        // IMPORTANTE: Precio al momento de la compra (snapshot)
        .addColumn('price_at_purchase', 'integer', (col) => col.notNull())
        .execute();

    await db.schema.createIndex('orders_user_index').on('orders').column('user_id').execute();
    await db.schema.createIndex('order_items_order_index').on('order_items').column('order_id').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('order_items').execute();
    await db.schema.dropTable('orders').execute();
}