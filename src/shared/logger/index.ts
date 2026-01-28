import pino from 'pino';
import { configOptions } from '../config/index.js';

// En desarrollo queremos logs bonitos (pretty), en producción JSON puro.

// Nota: Para leer la config aquí antes de iniciar Fastify, leemos process.env directamente
// o confiamos en los defaults. La validación estricta ocurrirá al levantar la app.
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard', // Formato de hora legible
      },
    }
    : undefined,
});