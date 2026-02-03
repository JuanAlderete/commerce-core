import { FastifyReply, FastifyRequest } from 'fastify';
import { paymentService } from './payments.service.js';

interface PayOrderBody {
    orderId: string;
}

export class PaymentController {
    async pay(request: FastifyRequest<{ Body: PayOrderBody }>, reply: FastifyReply) {
        const { orderId } = request.body;
        const userId = request.user?.sub;

        try {
            const result = await paymentService.processOrderPayment(orderId, userId);
            return reply.send(result);
        } catch (error: any) {
            const code = error.statusCode || 500;
            return reply.status(code).send({ error: error.message });
        }
    }
}

export const paymentController = new PaymentController();