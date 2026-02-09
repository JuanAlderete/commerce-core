import { FastifyReply, FastifyRequest } from 'fastify';
import { LoginBody } from './auth.dto.js';
import { User } from '../users/users.schema.js';
import { userRepository } from '../users/users.repository.js';
import * as bcrypt from 'bcrypt';

export class AuthController {
  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    const user = await userRepository.findByEmail(email);

    const hash = user?.password_hash ?? '$2b$10$dummyHashToPreventTimingAttack';
    const isValid = await bcrypt.compare(password, hash);

    if (!user || !isValid) {
      throw new Error('Invalid credentials');
    }

    return { user, token: this.generateToken(user, reply) };
  }

  async generateToken(user: User, reply: FastifyReply) {
    return await reply.jwtSign(
      {
        sub: user.id,
        role: user.role,
        email: user.email
      },
      { expiresIn: '7d' } // Expira en 7 días (ajustable)
    );
  }
}

export const authController = new AuthController();