import { FastifyReply, FastifyRequest } from 'fastify';
import { healthService } from './health.service';

export class HealthController {
  async check(request: FastifyRequest, reply: FastifyReply) {
    const result = await healthService.check();
    
    if (result.status === 'error') {
      reply.status(503);
    }
    
    return result;
  }
}

export const healthController = new HealthController();
