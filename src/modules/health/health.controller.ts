import { FastifyReply, FastifyRequest } from 'fastify';
import { healthService } from './health.service.js';

export class HealthController {
  async check(request: FastifyRequest, reply: FastifyReply) {
    const status = await healthService.getSystemStatus();
    
    // Si la base de datos está caída, devolvemos 503 (Service Unavailable)
    // Esto es CRÍTICO para que los balanceadores de carga dejen de mandarnos tráfico.
    const statusCode = status.status === 'operational' ? 200 : 503;
    
    return reply.status(statusCode).send(status);
  }
}

export const healthController = new HealthController();