import { FastifyReply, FastifyRequest } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    // 1. Verifica el header 'Authorization: Bearer <token>'
    // Si el token es inválido o expiró, esto lanza una excepción automáticamente.
    await request.jwtVerify();
    
    // 2. Si pasa, Fastify-JWT inyecta el payload en request.user
    // Ahora podemos saber quién es el usuario en el controlador.
  } catch (err) {
    reply.send(err);
  }
}