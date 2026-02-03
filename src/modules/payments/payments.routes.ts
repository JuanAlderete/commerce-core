import { FastifyInstance } from 'fastify';
import { paymentController } from './payments.controller.js';
import { optionalAuth } from '../../shared/hooks/optionalAuth.js';
import { Static, Type } from '@sinclair/typebox';

const PaySchema = Type.Object({
    orderId: Type.String({ format: 'uuid' })
});

type PayOrderBody = Static<typeof PaySchema>;

export async function paymentRoutes(app: FastifyInstance) {
    // Usamos optionalAuth para saber quién paga, pero permitimos guests si tienen el ID
    app.post<{ Body: PayOrderBody }>('/pay', {
        onRequest: [optionalAuth],
        schema: { body: PaySchema }
    }, paymentController.pay);
}