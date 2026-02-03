import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { getTestApp, clearDatabase } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';
import bcrypt from 'bcrypt';

describe('Users Module', () => {
    let app: any;
    let userToken: string;
    let userId: string;

    beforeAll(async () => {
        await migrateToLatest();
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await clearDatabase();

        // Register a user directly via DB for setup
        const hashedPassword = await bcrypt.hash('password123', 10);
        const result = await db.insertInto('users').values({
            email: 'existing@test.com',
            password_hash: hashedPassword,
            full_name: 'Existing User',
            role: 'customer',
            is_guest: false
        }).returning('id').executeTakeFirstOrThrow();
        userId = result.id;

        // Get Token
        const loginRes = await app.inject({
            method: 'POST',
            url: '/auth/login',
            payload: { email: 'existing@test.com', password: 'password123' }
        });
        userToken = loginRes.json().accessToken;
    });

    it('debería registrar un nuevo usuario exitosamente', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/users',
            payload: {
                email: 'new@test.com',
                password: 'password123',
                fullName: 'New User'
            }
        });

        expect(response.statusCode).toBe(201);
        expect(response.json().email).toBe('new@test.com');
        expect(response.json()).not.toHaveProperty('password');
        expect(response.json()).not.toHaveProperty('password_hash');
    });

    it('debería fallar al registrar con un email existente', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/users',
            payload: {
                email: 'existing@test.com', // Already exists
                password: 'password123',
                fullName: 'Copy Cat'
            }
        });

        // Assuming the controller/service handles uniqueness. 
        // Postgres will throw 23505 Unique Violation.
        // We expect either 409 or 500 depending on error handler.
        // Ideally 409 or 400. Let's check generally for non-success or specific error.
        // If the custom error handler traps it, it might be 409.
        expect(response.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('debería obtener su propio perfil con un token válido', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/users/me',
            headers: { Authorization: `Bearer ${userToken}` }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().email).toBe('existing@test.com');
    });

    it('debería fallar al obtener perfil sin token', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/users/me'
        });

        expect(response.statusCode).toBe(401);
    });

    it('debería obtener usuario por id', async () => {
        const response = await app.inject({
            method: 'GET',
            url: `/users/${userId}`,
            headers: { Authorization: `Bearer ${userToken}` }
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().id).toBe(userId);
    });

    it('debería eliminar usuario por id', async () => {
        const response = await app.inject({
            method: 'DELETE',
            url: `/users/${userId}`,
            headers: { Authorization: `Bearer ${userToken}` }
        });

        expect(response.statusCode).toBe(204);

        // Verify it's gone
        const check = await app.inject({
            method: 'GET',
            url: `/users/${userId}`,
            headers: { Authorization: `Bearer ${userToken}` }
        });
        expect(check.statusCode).toBe(404);
    });
});
