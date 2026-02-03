import { FastifyRequest, FastifyReply } from "fastify";

export async function optionalAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        // Si falla (no hay token o es inválido), NO hacemos nada.
        // request.user quedará undefined, y el controlador lo manejará.
    }
}