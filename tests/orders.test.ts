import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';
import crypto from 'node:crypto'; // Para generar UUIDs falsos

describe('Módulo de Órdenes (Checkout)', () => {
    let app: any;
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

        // 1. SETUP DE DATOS (Directo a DB para velocidad)
        // Creamos una categoría
        const categoryId = crypto.randomUUID();
        await db.insertInto('categories').values({
            id: categoryId,
            name: 'Test Category',
            slug: 'test-category'
        }).execute();

        // Creamos un producto con Stock = 10
        productId = crypto.randomUUID();
        await db.insertInto('products').values({
            id: productId,
            name: 'Perfume Test',
            slug: 'perfume-test',
            price_amount: 5000, // $50.00
            stock: 10,
            sku: 'TEST-SKU-001',
            category_id: categoryId,
            active: true
        }).execute();
    });

    // --- TEST CASE 1: GUEST CHECKOUT ---
    it('Debería permitir comprar como invitado (Guest Checkout)', async () => {
        const guestEmail = 'invitado@prueba.com';

        const response = await app.inject({
            method: 'POST',
            url: '/orders',
            // NOTA: No enviamos Header Authorization
            payload: {
                guestEmail: guestEmail,
                items: [
                    { productId: productId, quantity: 2 }
                ]
            }
        });

        // 1. Verificaciones HTTP
        expect(response.statusCode).toBe(201);
        const json = response.json();
        expect(json.status).toBe('pending');
        expect(json.total).toBe(10000); // 5000 * 2

        // 2. Verificaciones en Base de Datos (Efectos Secundarios)

        // A. El usuario "Sombra" debió crearse
        const guestUser = await db.selectFrom('users')
            .selectAll()
            .where('email', '=', guestEmail)
            .executeTakeFirst();

        expect(guestUser).toBeDefined();
        expect(guestUser?.role).toBe('guest'); // O el rol por defecto
        expect(guestUser?.password_hash).toBeNull(); // Importante: Sin password

        // B. La orden debe pertenecer a ese usuario
        const order = await db.selectFrom('orders')
            .selectAll()
            .where('id', '=', json.orderId)
            .executeTakeFirst();
        expect(order?.user_id).toBe(guestUser?.id);

        // C. El stock debió bajar de 10 a 8
        const product = await db.selectFrom('products')
            .select('stock')
            .where('id', '=', productId)
            .executeTakeFirst();
        expect(product?.stock).toBe(8);
    });

    // --- TEST CASE 2: VALIDACIÓN ---
    it('Debería fallar si no hay Token Y no hay Email', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/orders',
            payload: {
                // guestEmail: FALTANTE
                items: [{ productId, quantity: 1 }]
            }
        });

        expect(response.statusCode).toBe(401);
        expect(response.json().message).toContain('must be logged in OR provide a guestEmail');
    });

    // --- TEST CASE 3: STOCK INSUFICIENTE ---
    it('Debería fallar si piden más stock del disponible', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/orders',
            payload: {
                guestEmail: 'rico@prueba.com',
                items: [{ productId, quantity: 100 }] // Solo hay 10
            }
        });

        expect(response.statusCode).toBe(409); // Conflict
        expect(response.json().error).toContain('Insufficient stock');
    });
});