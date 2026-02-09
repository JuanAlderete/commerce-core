import { FastifyReply, FastifyRequest } from 'fastify';
import { idempotencyRepository } from '../db/idempotency.repository.js';

// Extendemos Request para guardar la key y saber si debemos guardar la respuesta
declare module 'fastify' {
    interface FastifyRequest {
        idempotencyKey?: string;
    }
}

export async function idempotencyHook(request: FastifyRequest, reply: FastifyReply) {
    const key = request.headers['idempotency-key'] as string;

    // 1. Si no hay key, seguimos normal (no es idempotente)
    if (!key) return;

    // 2. Buscamos si ya existe
    const cachedResponse = await idempotencyRepository.findByKey(key);

    if (cachedResponse) {
        request.log.info({ key }, 'Idempotency Hit: Returning cached response');

        // IMPORTANTE: Devolvemos exactamente lo que guardamos
        // Saltamos el controlador y respondemos directamente
        return reply
            .code(cachedResponse.response_status)
            .header('Content-Type', 'application/json')
            .header('X-Idempotency-Hit', 'true') // Marca para debugging
            .send(cachedResponse.response_body);
    }

    // 3. Si no existe, guardamos la key en el request para usarla en 'onSend'
    request.idempotencyKey = key;
}

// Este hook captura la respuesta saliente y la guarda
export async function saveIdempotencyResponse(request: FastifyRequest, reply: FastifyReply, payload: any) {
    const key = request.idempotencyKey;

    // Solo guardamos si había una key Y la petición fue exitosa (o error controlado)
    // No guardamos errores 500 crashes del servidor generalmente, para permitir reintentos.
    if (key && reply.statusCode < 500) {
        try {
            let bodyToSave = payload;

            // Fastify a veces entrega el payload como string (JSON serializado)
            try {
                if (typeof payload === 'string') {
                    bodyToSave = JSON.parse(payload);
                }
            } catch (e) {
                // Si no es JSON, lo guardamos como texto o ignoramos
            }

            await idempotencyRepository.save({
                key: key,
                response_status: reply.statusCode,
                response_body: bodyToSave,
                request_path: request.url,
                request_params: JSON.stringify(request.body || {})
            });

            request.log.info({ key }, 'Idempotency Key Saved');

        } catch (error) {
            // Si falla el guardado (ej: condición de carrera), logueamos pero no rompemos la respuesta al usuario
            request.log.error({ err: error }, 'Failed to save idempotency key');
        }
    }

    return payload;
}