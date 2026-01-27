import { FastifyInstance } from 'fastify';
import { healthController } from './health.controller';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', healthController.check);
}
