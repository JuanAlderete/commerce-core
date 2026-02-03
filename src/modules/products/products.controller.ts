import { FastifyReply, FastifyRequest } from 'fastify';
import { productRepository } from './products.repository.js';
import { categoryRepository } from '../categories/categories.repository.js';
import { CreateProductBody } from './products.dto.js';

export class ProductController {
    async create(request: FastifyRequest<{ Body: CreateProductBody }>, reply: FastifyReply) {
        const { name, slug, description, price, stock, sku, categoryId, imageUrl } = request.body;

        // 1. Validar que la categoría exista (Integridad Referencial)
        // Opcional: Postgres fallaría igual, pero es mejor dar un error claro al cliente.
        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            return reply.status(404).send({ error: 'Category not found' });
        }

        // 2. Conversión de Moneda: Float -> Integer (Centavos)
        // 10.50 -> 1050
        const priceInCents = Math.round(price * 100);

        try {
            const product = await productRepository.create({
                name,
                slug,
                description: description || null,
                price_amount: priceInCents,
                stock,
                sku,
                category_id: categoryId,
                image_url: imageUrl || null
            });

            return reply.status(201).send(product);
        } catch (error: any) {
            if (error.code === '23505') { // Duplicate unique key
                return reply.status(409).send({ error: 'Product SKU or Slug already exists' });
            }
            throw error;
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };
        const products = await productRepository.findAll(limit, offset);

        return reply.send(products);
    }
}

export const productController = new ProductController();