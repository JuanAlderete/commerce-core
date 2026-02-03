import { db } from '../../shared/db/index.js';
import { NewProduct, Product } from './products.schema.js';
import { Database } from '../../shared/db/index.js';
import { Transaction } from 'kysely/dist/esm/kysely.js';

export class ProductRepository {
    async create(product: NewProduct): Promise<Product> {
        return await db
            .insertInto('products')
            .values(product)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async findAll(limit = 20, offset = 0): Promise<Product[]> {
        return await db
            .selectFrom('products')
            .selectAll()
            .where('active', '=', true) // Solo mostramos productos activos
            .limit(limit)
            .offset(offset)
            .execute();
    }

    async findBySlug(slug: string): Promise<Product | undefined> {
        return await db
            .selectFrom('products')
            .selectAll()
            .where('slug', '=', slug)
            .executeTakeFirst();
    }

    async findById(id: string): Promise<Product | undefined> {
        return await db
            .selectFrom('products')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
    }

    async decrementStock(productId: string, quantity: number, tx: Transaction<Database> = db as any): Promise<void> {
        const result = await tx
            .updateTable('products')
            .set((eb) => ({
                stock: eb('stock', '-', quantity) // Resta atómica: stock = stock - quantity
            }))
            .where('id', '=', productId)
            .where('stock', '>=', quantity)
            .executeTakeFirst();

        if (result.numUpdatedRows === BigInt(0)) {
            throw new Error(`Insufficient stock for product ${productId}`);
        }
    }
}

export const productRepository = new ProductRepository();