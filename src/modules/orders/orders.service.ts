import { sql } from 'kysely/dist/esm/index.js';
import { db } from '../../shared/db/index.js';
import { productRepository } from '../products/products.repository.js';
import { orderRepository } from './orders.repository.js';

interface CreateOrderItemDto {
    productId: string;
    quantity: number;
}

export class OrderService {
    async createOrder(userId: string, items: CreateOrderItemDto[]) {
        return await db.transaction().execute(async (trx) => {
            // Extraer IDs únicos y hacer UNA SOLA query con lock
            const productIds = items.map(item => item.productId);

            const products = await trx
                .selectFrom('products')
                .selectAll()
                .where('id', 'in', productIds)
                .forUpdate() // 🔒 Bloquea TODOS los productos a la vez
                .execute();

            // Validar existencia, stock y estado en UNA pasada
            let totalAmount = 0;
            const orderItemsData: Array<{
                product_id: string;
                quantity: number;
                price_at_purchase: number;
            }> = [];

            for (const item of items) {
                const product = products.find(p => p.id === item.productId);

                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                if (!product.active) {
                    throw new Error(`Product "${product.name}" is not available`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(
                        `Insufficient stock for "${product.name}". ` +
                        `Available: ${product.stock}, Requested: ${item.quantity}`
                    );
                }
                const lineTotal = product.price_amount * item.quantity;
                totalAmount += lineTotal;

                orderItemsData.push({
                    product_id: item.productId,
                    quantity: item.quantity,
                    price_at_purchase: product.price_amount
                });
            }

            // Decrementar stock (UNA SOLA VEZ)
            for (const item of items) {
                await trx
                    .updateTable('products')
                    .set({ stock: sql`stock - ${item.quantity}` })
                    .where('id', '=', item.productId)
                    .execute();
            }

            // Crear la orden
            const order = await trx
                .insertInto('orders')
                .values({
                    user_id: userId,
                    total_amount: totalAmount,
                    status: 'pending',
                })
                .returningAll()
                .executeTakeFirstOrThrow();

            // Crear los items de la orden
            const itemsWithOrderId = orderItemsData.map(item => ({
                ...item,
                order_id: order.id,
            }));

            await trx
                .insertInto('order_items')
                .values(itemsWithOrderId)
                .execute();

            // Retornar resultado
            return {
                orderId: order.id,
                total: totalAmount,
                status: order.status,
            };
        });
    }
}

export const orderService = new OrderService();