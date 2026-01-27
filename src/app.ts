import fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { appRoutes } from './routes';
import { logger } from './shared/logger';

export function buildApp() {
  const app = fastify({
    logger: false, // We use our own logger instance
    disableRequestLogging: true, // we can handle this manually if needed or let pino handle it, but standard is often to let fastify use a logger. However, we want strict control. Let's use our logger instance if we can or just use standard fastify logger injection. 
    // "Configura una instancia global de Pino... en server.ts" -> usually passed to fastify. 
    // Actually, user said: "Configura una instancia global de Pino en src/shared/logger."
    // And "src/app.ts: Aquí configuras Fastify, registras los plugins...".
    // I will attach our logger to fastify or simply use it globally. 
    // Fastify has built-in pino support. It is better to use `logger: logger` here if compatible, or just keep them separate. 
    // Given the "Global instance" requirement, I'll pass the logger instance to fastify so `req.log` works.
  });

  // Attach global logger
  // Note: fastify logger option expects a pino instance or configuration.
  // We will re-import logger in server.ts to start app.
  
  app.register(helmet);
  app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  app.register(appRoutes);

  app.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, reqId: request.id }, 'Global Error Handler');
    
    // Never leak internal errors
    const statusCode = error.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : error.message;

    reply.status(statusCode).send({
      statusCode,
      error: message, // Simplified error message
    });
  });

  return app;
}
