import { FastifyInstance } from 'fastify';
import { paymentController } from './payments.controller.js';
import { optionalAuth } from '../../shared/hooks/optionalAuth.js';
import { idempotencyHook, saveIdempotencyResponse } from '../../shared/hooks/idempotency.js';
import { Static, Type } from '@sinclair/typebox';

const PaySchema = Type.Object({
    orderId: Type.String({ format: 'uuid' })
});

type PayOrderBody = Static<typeof PaySchema>;

export async function paymentRoutes(app: FastifyInstance) {
    app.post<{ Body: PayOrderBody }>('/pay', {
        preHandler: [idempotencyHook],
        onSend: [saveIdempotencyResponse],
        onRequest: [optionalAuth],
        schema: {
            body: PaySchema,
            headers: Type.Object({
                'idempotency-key': Type.Optional(Type.String())
            })
        }
    }, paymentController.pay);
}