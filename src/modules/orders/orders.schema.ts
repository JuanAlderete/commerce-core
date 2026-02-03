import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface OrderTable {
    id: Generated<string>;
    user_id: string;
    status: Generated<string>; // 'pending' | 'paid' | 'shipped' | 'cancelled'
    total_amount: number;
    currency: Generated<string>;
    created_at: Generated<Date>;
    updated_at: Generated<Date>;
}

export type Order = Selectable<OrderTable>;
export type NewOrder = Insertable<OrderTable>;

export interface OrderItemTable {
    id: Generated<string>;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
}

export type OrderItem = Selectable<OrderItemTable>;
export type NewOrderItem = Insertable<OrderItemTable>;