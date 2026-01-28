import { FastifyInstance } from 'fastify';
import { authController } from './auth.controller.js';
import { LoginSchema, LoginBody } from './auth.dto.js';

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>('/login', {
    schema: {
        body: LoginSchema
    }
  }, authController.login);
}