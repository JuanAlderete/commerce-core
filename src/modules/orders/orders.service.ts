import { db } from '../../shared/db/index.js';
import { productRepository } from '../products/products.repository.js';
import { orderRepository } from './orders.repository.js';

interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}

export class OrderService {
    async createOrder(userId: string, items: CreateOrderItemDto[]) {
        return await db.transaction().execute(async (tx) => {
            let totalAmount = 0;
            const orderItemsData = [];

            // 1. Verificaciones y preparación de datos
            for (const item of items) {
                // Obtenemos precio actual (dentro de la transacción para evitar race conditions sería ideal, 
                // pero por simplicidad de lectura confiamos en el select previo o locks, 
                // aquí usamos el repo normal, pero para ser estrictos deberíamos bloquear el row).

                // Usamos findById que ya tienes (podrías pasarlo a transaccional si quieres bloquear lectura)
                // Nota: findById actualmente usa 'db' global. Para bloqueo estricto 'FOR UPDATE' se necesita más código.
                // Asumiremos que decrementStock fallará si no hay stock, lo cual es seguro.
                const product = await productRepository.findById(item.productId);

                // (Hack temporal: consultamos producto fuera de tx, el decremento SÍ es transaccional y seguro)
                const productData = await tx.selectFrom('products')
                    .selectAll()
                    .where('id', '=', item.productId)
                    .executeTakeFirstOrThrow();

                if (!productData.active) throw new Error(`Product ${productData.name} is inactive`);

                const lineTotal = productData.price_amount * item.quantity;
                totalAmount += lineTotal;

                orderItemsData.push({
                    product_id: item.productId,
                    quantity: item.quantity,
                    price_at_purchase: productData.price_amount
                });

                // 2. DESCONTAR STOCK (Si falla, se revierte todo)
                await productRepository.decrementStock(item.productId, item.quantity, tx);
            }

            // 3. Crear la Orden
            const order = await orderRepository.createOrder({
                user_id: userId,
                total_amount: totalAmount,
                status: 'pending'
            }, tx);

            // 4. Crear los Items asociados
            const finalItems = orderItemsData.map(i => ({ ...i, order_id: order.id }));
            await orderRepository.createOrderItems(finalItems, tx);

            return {
                orderId: order.id,
                total: totalAmount,
                status: 'pending'
            };
        });
    }
}

export const orderService = new OrderService();