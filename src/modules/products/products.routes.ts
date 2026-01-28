import { FastifyInstance } from 'fastify';
import { productController } from './products.controller.js';
import { authenticate } from '../../shared/hooks/auth.js';
import { requireRole } from '../../shared/hooks/rbac.js';
import { CreateProductSchema } from './products.dto.js';

export async function productRoutes(app: FastifyInstance) {
    app.get('/', productController.list);

    app.post<{ Body: typeof CreateProductSchema }>('/', {
        onRequest: [authenticate, requireRole(['admin'])],
        schema: {
            body: CreateProductSchema
        }
    }, productController.create);
}