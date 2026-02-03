import { orderRepository } from '../orders/orders.repository.js';
import { paymentProvider } from '../../shared/providers/payment/mock.provider.js';

export class PaymentService {
    async processOrderPayment(orderId: string, userId?: string) {
        // 1. Validar que la orden existe
        const order = await orderRepository.findById(orderId);
        if (!order) {
            throw { statusCode: 404, message: 'Order not found' };
        }

        // 2. Seguridad: Validar que la orden pertenezca al usuario (si está logueado)
        // Si userId viene undefined (guest), saltamos esto o validamos email.
        // Por simplicidad, si viene userId lo chequeamos.
        if (userId && order.user_id !== userId) {
            throw { statusCode: 403, message: 'Unauthorized access to this order' };
        }

        // 3. Validar estado (No cobrar dos veces)
        if (order.status === 'paid') {
            throw { statusCode: 400, message: 'Order is already paid' };
        }
        if (order.status === 'cancelled') {
            throw { statusCode: 400, message: 'Cannot pay a cancelled order' };
        }

        // 4. Procesar pago con el Proveedor (Mock)
        const paymentResult = await paymentProvider.processPayment(
            order.id,
            order.total_amount,
            order.currency
        );

        // 5. Manejar resultado
        if (!paymentResult.success) {
            throw {
                statusCode: 402, // Payment Required
                message: `Payment failed: ${paymentResult.error}`
            };
        }

        // 6. Éxito: Actualizar DB
        await orderRepository.updateStatus(order.id, 'paid');

        return {
            status: 'paid',
            transactionId: paymentResult.transactionId,
            orderId: order.id
        };
    }
}

export const paymentService = new PaymentService();