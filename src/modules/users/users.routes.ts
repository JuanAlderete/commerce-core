import { FastifyInstance } from 'fastify';
import { userController } from './users.controller.js';
import { CreateUserSchema, UpdateUserSchema, CreateUserBody, UpdateUserBody } from './users.dto.js';
import { authenticate } from '../../shared/hooks/auth.js';

export async function userRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateUserBody }>('/', {
    schema: {
        body: CreateUserSchema
    }
  }, userController.register);

  app.get('/me', { onRequest: [authenticate] }, userController.me);
  app.get('/', { onRequest: [authenticate] }, userController.findAllUsers);
  app.get<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, userController.findUserById);
  
  app.put<{ Params: { id: string }; Body: UpdateUserBody }>('/:id', { 
    onRequest: [authenticate],
    schema: {
        body: UpdateUserSchema
    }
  }, userController.updateUser);
  
  app.delete<{ Params: { id: string } }>('/:id', { onRequest: [authenticate] }, userController.deleteUser);
}