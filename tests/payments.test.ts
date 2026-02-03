import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';

describe('Payments Module', () => {
    let app: any;
    let userId: string;
    let userToken: string;
    let otherUserId: string;
    let otherToken: string;
    let productId: string;

    beforeAll(async () => {
        await migrateToLatest();
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();

        // 1. Setup Users
        const hashedPassword = await bcrypt.hash('password123', 10);

        // User 1
        const u1 = await db.insertInto('users').values({
            email: 'payer@test.com',
            password_hash: hashedPassword,
            full_name: 'Payer',
            role: 'customer',
            is_guest: false
        }).returning('id').executeTakeFirstOrThrow();
        userId = u1.id;

        // User 2
        const u2 = await db.insertInto('users').values({
            email: 'hacker@test.com',
            password_hash: hashedPassword,
            full_name: 'Hacker',
            role: 'customer',
            is_guest: false
        }).returning('id').executeTakeFirstOrThrow();
        otherUserId = u2.id;

        // Login Tokens
        const res1 = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: 'payer@test.com', password: 'password123' } });
        userToken = res1.json().accessToken; // FIXED: accessToken

        const res2 = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: 'hacker@test.com', password: 'password123' } });
        otherToken = res2.json().accessToken; // FIXED: accessToken

        // 2. Setup Product & Category
        const catId = crypto.randomUUID();
        await db.insertInto('categories').values({ id: catId, name: 'Pay Cat', slug: 'pay-cat' }).execute();

        productId = crypto.randomUUID();
        await db.insertInto('products').values({
            id: productId,
            name: 'Pay Item',
            slug: 'pay-item',
            price_amount: 1000,
            stock: 100,
            sku: 'PAY-001',
            category_id: catId,
            active: true
        }).execute();
    });

    async function createOrder(forUserId?: string, status: 'pending' | 'paid' | 'cancelled' = 'pending') {
        let finalUserId = forUserId;

        // If guest (no userId provided), create a guest user
        if (!finalUserId) {
            const guest = await db.insertInto('users').values({
                email: `guest-${crypto.randomUUID()}@test.com`,
                password_hash: '', // No password
                full_name: 'Guest User',
                role: 'guest',
                is_guest: true
            }).returning('id').executeTakeFirstOrThrow();
            finalUserId = guest.id;
        }

        const orderId = crypto.randomUUID();
        await db.insertInto('orders').values({
            id: orderId,
            user_id: finalUserId!, // Guaranteed to have string now
            total_amount: 1000,
            currency: 'USD',
            status: status
        }).execute();

        await db.insertInto('order_items').values({
            id: crypto.randomUUID(),
            order_id: orderId,
            product_id: productId,
            quantity: 1,
            price_at_purchase: 1000 // FIXED: price_at_purchase
        }).execute();

        return orderId;
    }

    it('debería procesar el pago de su propia orden exitosamente', async () => {
        const orderId = await createOrder(userId);

        const response = await app.inject({
            method: 'POST',
            url: '/payments/pay',
            headers: { Authorization: `Bearer ${userToken}` },
            payload: { orderId }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().status).toBe('paid');

        // Check DB
        const order = await db.selectFrom('orders').select('status').where('id', '=', orderId).executeTakeFirst();
        expect(order?.status).toBe('paid');
    });

    it('debería permitir pago de invitado si la orden pertenece a un invitado', async () => {
        const orderId = await createOrder(undefined); // Guest order with Guest User

        const response = await app.inject({
            method: 'POST',
            url: '/payments/pay',
            // No auth header
            payload: { orderId }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().status).toBe('paid');
    });

    it('debería prohibir al usuario pagar la orden de otro usuario', async () => {
        const orderId = await createOrder(userId); // Belongs to User 1

        const response = await app.inject({
            method: 'POST',
            url: '/payments/pay',
            headers: { Authorization: `Bearer ${otherToken}` }, // User 2 tries to pay
            payload: { orderId }
        });

        expect(response.statusCode).toBe(403);
    });

    it('debería fallar si la orden no existe', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/payments/pay',
            headers: { Authorization: `Bearer ${userToken}` },
            payload: { orderId: crypto.randomUUID() }
        });

        expect(response.statusCode).toBe(404);
    });

    it('debería fallar si la orden ya está pagada', async () => {
        const orderId = await createOrder(userId, 'paid');

        const response = await app.inject({
            method: 'POST',
            url: '/payments/pay',
            headers: { Authorization: `Bearer ${userToken}` },
            payload: { orderId }
        });

        expect(response.statusCode).toBe(400); // Bad Request
        expect(response.json().error).toMatch(/already paid/i);
    });
});
