import { FastifyReply, FastifyRequest } from 'fastify';
import { authService } from './auth.service.js';
import { LoginBody } from './auth.dto.js';

export class AuthController {
  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    // 1. Validar credenciales
    const user = await authService.validateUser(email, password);

    if (!user) {
      // 401 Unauthorized es el código correcto para fallo de login
      return reply.status(401).send({
        statusCode: 401,
        error: 'Invalid email or password'
      });
    }

    // 2. Generar Token JWT
    // payload: qué datos viajan ENCRIPTADOS dentro del token.
    // Usamos 'sub' (subject) para el ID, es el estándar JWT.
    const token = await reply.jwtSign(
      { 
        sub: user.id,
        role: user.role,
        email: user.email 
      }, 
      { expiresIn: '7d' } // Expira en 7 días (ajustable)
    );

    // 3. Responder
    return reply.send({
      accessToken: token,
      user
    });
  }
}

export const authController = new AuthController();