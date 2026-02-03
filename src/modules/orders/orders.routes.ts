import { FastifyInstance } from 'fastify';
import { authenticate } from '../../shared/hooks/auth.js';
import { optionalAuth } from '../../shared/hooks/optionalAuth.js';
import { CreateOrderSchema, CreateOrderBody } from './orders.dto.js';
import { orderController } from './orders.controller.js';

export async function orderRoutes(app: FastifyInstance) {
    app.get('/', { onRequest: [authenticate] }, orderController.list);

    app.post<{ Body: CreateOrderBody }>('/', {
        onRequest: [optionalAuth],
        schema: {
            body: CreateOrderSchema
        }
    }, orderController.create);
}