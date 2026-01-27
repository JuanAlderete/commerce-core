import { FastifyInstance } from 'fastify';
import { healthRoutes } from './modules/health/health.routes';

export async function appRoutes(app: FastifyInstance) {
  app.register(healthRoutes);
}
