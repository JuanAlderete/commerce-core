import { FastifyReply, FastifyRequest } from 'fastify';
import { userService } from './users.service.js';
import { userRepository } from './users.repository.js';
import { CreateUserBody, UpdateUserBody, CreateUserSchema, UpdateUserSchema } from './users.dto.js';

export class UserController {
  async register(request: FastifyRequest<{ Body: CreateUserBody }>, reply: FastifyReply) {
    const { email, password, fullName } = request.body;

    const user = await userService.registerUser({
      email,
      password,
      full_name: fullName, // Mapeo camelCase -> snake_case
    });

    return reply.status(201).send(user);
  }

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userJwt = request.user;

    if (!userJwt) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const user = await userRepository.findByEmail(userJwt.email);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Devolvemos el usuario sin el hash
    const { password_hash, ...cleanUser } = user;
    return cleanUser;
  }

  async findUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    if (!id) {
      return reply.status(400).send({ error: 'Missing user ID' });
    }

    const user = await userService.findUserById(id);

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.status(200).send(user);
  }

  async findAllUsers(request: FastifyRequest, reply: FastifyReply) {
    const users = await userService.findAllUsers();

    return reply.status(200).send(users);
  }

  async updateUser(request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserBody }>, reply: FastifyReply) {
    const { id } = request.params;
    const { email, password, fullName } = request.body;

    if (!id) {
      return reply.status(400).send({ error: 'Missing user ID' });
    }

    const user = await userService.updateUser(id, {
      email,
      password,
      full_name: fullName,
    });

    return reply.status(200).send(user);
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    if (!id) {
      return reply.status(400).send({ error: 'Missing user ID' });
    }

    await userService.deleteUser(id);

    return reply.status(204).send();
  }
}

export const userController = new UserController();