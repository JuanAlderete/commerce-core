import { Transaction } from 'kysely';
import { db, Database } from '../../shared/db/index.js';
import { NewOrder, NewOrderItem, Order } from './orders.schema.js';

export class OrderRepository {
    // Permitimos pasar una transacción (tx) para operaciones atómicas
    async createOrder(order: NewOrder, tx: Transaction<Database> = db as any): Promise<Order> {
        return await tx
            .insertInto('orders')
            .values(order)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async createOrderItems(items: NewOrderItem[], tx: Transaction<Database> = db as any) {
        return await tx
            .insertInto('order_items')
            .values(items)
            .returningAll()
            .execute();
    }

    async findAll(limit: number, offset: number) {
        return await db
            .selectFrom('orders')
            .selectAll()
            .limit(limit)
            .offset(offset)
            .execute();
    }

    async findById(id: string): Promise<Order | undefined> {
        return await db
            .selectFrom('orders')
            .selectAll()
            .where('id', '=', id)
            .executeTakeFirst();
    }

    async updateStatus(id: string, status: string): Promise<Order> {
        return await db
            .updateTable('orders')
            .set({ status: status, updated_at: new Date() })
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
}

export const orderRepository = new OrderRepository();