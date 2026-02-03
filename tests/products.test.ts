import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';

describe('Flujo de Productos', () => {
    let app: any;
    let adminToken: string;
    let categoryId: string;

    beforeAll(async () => {
        await migrateToLatest();
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    // Limpiamos datos antes de cada test para tener un entorno fresco
    beforeEach(async () => {
        await clearDatabase();

        // Crear usuario Admin para test
        const registerRes = await app.inject({
            method: 'POST',
            url: '/users',
            payload: { email: 'admin@test.com', password: 'password123', fullName: 'Admin' }
        });

        // Hack: promover a admin directamente en DB
        await db.updateTable('users')
            .set({ role: 'admin' })
            .where('email', '=', 'admin@test.com')
            .execute();

        // Login para obtener token
        const loginRes = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'admin@test.com', password: 'password123' }
        });
        adminToken = loginRes.json().accessToken;

        // Crear categoría base
        const catRes = await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: { name: 'Test Cat', slug: 'test-cat' }
        });
        categoryId = catRes.json().id;
    });

    it('debería crear un producto exitosamente', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/products',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                name: 'Nuevo Perfume',
                slug: 'nuevo-perfume',
                price: 100.00,
                stock: 10,
                sku: 'SKU-123',
                categoryId: categoryId
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().name).toBe('Nuevo Perfume');
        expect(response.json().price_amount).toBe(10000); // 100.00 * 100
    });

    it('debería fallar si el SKU ya existe', async () => {
        // Crear primera vez (Nombres largos para pasar validación > 3 chars)
        await app.inject({
            method: 'POST',
            url: '/products',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                name: 'Producto Original',
                slug: 'producto-original',
                price: 10,
                stock: 1,
                sku: 'SKU-DUPLICADO',
                categoryId
            }
        });

        // Crear segunda vez (Mismo SKU)
        const response = await app.inject({
            method: 'POST',
            url: '/products',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                name: 'Producto Copia', // Nombre válido > 3 chars
                slug: 'producto-copia', // Slug válido > 3 chars
                price: 10,
                stock: 1,
                sku: 'SKU-DUPLICADO', // ¡ESTO ES LO QUE VA A CHOCAR!
                categoryId
            }
        });

        // Ahora sí debería ser 409 Conflict (porque pasó la validación de esquema)
        expect(response.statusCode).toBe(409);
    });
});