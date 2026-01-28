import { db } from '../../shared/db/index.js';
import { NewProduct, Product } from './products.schema.js';

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
}

export const productRepository = new ProductRepository();