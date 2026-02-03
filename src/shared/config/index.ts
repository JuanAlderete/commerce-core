import env from '@fastify/env';
import { FastifyInstance } from 'fastify';

// 1. Definimos el esquema JSON Schema para validación estricta
const schema = {
  type: 'object',
  required: ['PORT', 'DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'],
  properties: {
    PORT: {
      type: 'number',
      default: 3000
    },
    NODE_ENV: {
      type: 'string',
      default: 'development'
    },
    LOG_LEVEL: {
      type: 'string',
      default: 'info'
    },
    DB_HOST: { type: 'string' },
    DB_PORT: { type: 'number' },
    DB_USER: { type: 'string' },
    DB_PASSWORD: { type: 'string' },
    DB_NAME: { type: 'string' },
    JWT_SECRET: { type: 'string' },
  }
};

// 2. Configuración del plugin
export const configOptions = {
  confKey: 'config',
  schema: schema,
  dotenv: process.env.NODE_ENV !== 'test', 
  data: process.env
};

// Tipado para TypeScript (Augmentation)
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT: number;
      NODE_ENV: string;
      LOG_LEVEL: string;
      DB_HOST: string;
      DB_PORT: number;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      JWT_SECRET: string;
    };
  }
}