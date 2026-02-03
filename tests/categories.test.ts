import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';
import bcrypt from 'bcrypt';

describe('Categories Module', () => {
    let app: any;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        await migrateToLatest();
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Create Admin
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.insertInto('users').values({
            email: 'admin@test.com',
            password_hash: hashedPassword,
            full_name: 'Admin User',
            role: 'admin',
            is_guest: false
        }).execute();

        // Create Normal User
        await db.insertInto('users').values({
            email: 'user@test.com',
            password_hash: hashedPassword,
            full_name: 'Normal User',
            role: 'customer',
            is_guest: false
        }).execute();

        // Get Admin Token
        const adminLogin = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'admin@test.com', password: 'password123' }
        });
        adminToken = adminLogin.json().accessToken;

        // Get User Token
        const userLogin = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'user@test.com', password: 'password123' }
        });
        userToken = userLogin.json().accessToken;
    });

    it('debería permitir al admin crear una categoría', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: {
                name: 'Electronics',
                slug: 'electronics'
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().name).toBe('Electronics');
    });

    it('debería denegar a un usuario normal crear una categoría', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { Authorization: `Bearer ${userToken}` },
            payload: {
                name: 'Hacked Cat',
                slug: 'hacked-cat'
            }
        });

        // RBAC usually returns 403 Forbidden
        expect(response.statusCode).toBe(403);
    });

    it('debería denegar a un invitado crear una categoría', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/categories',
            // No Authorization header
            payload: {
                name: 'Guest Cat',
                slug: 'guest-cat'
            }
        });

        expect(response.statusCode).toBe(401);
    });

    it('debería listar categorías públicamente', async () => {
        // First create one as admin
        await app.inject({
            method: 'POST',
            url: '/categories',
            headers: { Authorization: `Bearer ${adminToken}` },
            payload: { name: 'Books', slug: 'books' }
        });

        const response = await app.inject({
            method: 'GET',
            url: '/categories'
        });

        expect(response.statusCode).toBe(200);
        const categories = response.json();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length).toBeGreaterThan(0);
        expect(categories[0].name).toBe('Books');
    });
});
