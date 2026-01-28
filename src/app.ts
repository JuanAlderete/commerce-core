import fastify from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import fastifyEnv from '@fastify/env';
import { configOptions } from './shared/config/index.js';
import { logger } from './shared/logger/index.js';
import { appRoutes } from './routes.js';
import fjwt from '@fastify/jwt';

// Convertimos la función a async para asegurar el orden de carga (especialmente env)
export async function buildApp() {
  const app = fastify({
    // 1. Inyección de Dependencia:
    // Pasamos nuestra instancia configurada de Pino.
    // Fastify la usará para sus logs internos y nos dará 'request.log' con request-id.
    logger: logger,

    // Opcional: Si los logs de "incoming request" te hacen mucho ruido, 
    // puedes descomentar esto. Pero para empezar, déjalo activado.
    // disableRequestLogging: true, 
  });

  // 2. Carga de Configuración (CRÍTICO: PRIMERO QUE TODO)
  await app.register(fastifyEnv, configOptions);

  // 3. Seguridad
  await app.register(fjwt, {
    secret: app.config.JWT_SECRET,
  });
  await app.register(helmet);

  // 4. Rate Limiting (Protección contra DDoS/Brute Force)
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // 5. Rutas de la Aplicación
  await app.register(appRoutes);

  // 6. Manejador Global de Errores
  app.setErrorHandler((error, request, reply) => {
    // Usamos request.log para mantener el contexto (requestId)
    request.log.error({
      err: error,
      phase: 'global_error_handler',
      url: request.url,
      method: request.method
    }, 'Uncaught Exception');

    const statusCode = error.statusCode || 500;

    // SECURITY: En producción (status 500), JAMÁS devolver el mensaje real del error
    // porque puede contener info de la DB o paths del servidor.
    const message = statusCode === 500
      ? 'Internal Server Error'
      : error.message;

    reply.status(statusCode).send({
      statusCode,
      error: message,
      // Opcional: timestamp: new Date().toISOString()
    });
  });

  return app;
}