import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getTestApp } from './setup.js';
import { migrateToLatest } from '../src/shared/db/migrate.js';
import { db } from '../src/shared/db/index.js';

describe('Health Module', () => {
    let app: any;

    beforeAll(async () => {
        // 1. Correr migraciones en DB de test
        await migrateToLatest();
        // 2. Levantar App
        app = await getTestApp();
    });

    afterAll(async () => {
        await app.close();
    });

    it('GET /health debería devolver 200 OK', async () => {
        // .inject() simula una petición sin latencia de red
        const response = await app.inject({
            method: 'GET',
            url: '/health'
        });

        expect(response.statusCode).toBe(200);
        const json = response.json();
        expect(json.status).toBe('operational');
        expect(json.checks.database).toBe('up');
    });
});