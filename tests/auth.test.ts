import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';
import bcrypt from 'bcrypt';

describe('Auth Module', () => {
    let app: any;

    beforeAll(async () => {
        await migrateToLatest();
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Seed a user
        const hashedPassword = await bcrypt.hash('password123', 10);
        await db.insertInto('users').values({
            email: 'user@test.com',
            password_hash: hashedPassword,
            full_name: 'Test User',
            role: 'customer',
            is_guest: false
        }).execute();
    });

    it('debería iniciar sesión exitosamente con credenciales correctas', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'user@test.com',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toHaveProperty('accessToken');
    });

    it('debería fallar al iniciar sesión con contraseña incorrecta', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'user@test.com',
                password: 'wrongpassword'
            }
        });

        expect(response.statusCode).toBe(401);
        expect(response.json().error).toContain('Invalid email or password');
    });

    it('debería fallar al iniciar sesión con un usuario inexistente', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {
                email: 'nonexistent@test.com',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(401);
        expect(response.json().error).toContain('Invalid email or password');
    });
});
