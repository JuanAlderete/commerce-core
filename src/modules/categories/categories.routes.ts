import { FastifyInstance } from 'fastify';
import { categoryController } from './categories.controller.js';
import { CreateCategorySchema, CreateCategoryBody } from './categories.dto.js';
import { authenticate } from '../../shared/hooks/auth.js';
import { requireRole } from '../../shared/hooks/rbac.js';

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/', categoryController.list);

  app.post<{ Body: CreateCategoryBody }>('/', {
    onRequest: [authenticate, requireRole(['admin'])],
    schema: {
        body: CreateCategorySchema
    }
  }, categoryController.create);
}