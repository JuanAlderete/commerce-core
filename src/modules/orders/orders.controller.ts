import { FastifyReply, FastifyRequest } from "fastify";
import { orderService } from "./orders.service.js";
import { orderRepository } from "./orders.repository.js";
import { CreateOrderBody } from "./orders.dto.js";
import { userService } from "../users/users.service.js";

export class OrderController {

    async create(request: FastifyRequest<{ Body: CreateOrderBody }>, reply: FastifyReply) {
        const { items, guestEmail } = request.body;

        let userId: string;
        if (request.user) {
            userId = request.user.sub;
        }
        else if (guestEmail) {
            const guestUser = await userService.findOrCreateGuest(guestEmail);
            userId = guestUser.id;
        }
        else {
            return reply.status(401).send({
                error: 'Unauthorized',
                message: 'You must be logged in OR provide a guestEmail'
            });
        }

        try {
            const result = await orderService.createOrder(userId, items);
            return reply.status(201).send(result);
        } catch (error: any) {
            if (error.message.includes('Insufficient stock')) {
                return reply.status(409).send({ error: error.message });
            }
            throw error;
        }
    }

    async list(request: FastifyRequest, reply: FastifyReply) {
        const { limit = 20, offset = 0 } = request.query as { limit?: number; offset?: number };
        const orders = await orderRepository.findAll(limit, offset);
        return reply.send(orders);
    }
}

export const orderController = new OrderController();