import { db } from './index.js';
import { NewIdempotencyKey } from '../types/idempotency.schema.js';

export class IdempotencyRepository {
    async findByKey(key: string) {
        return await db
            .selectFrom('idempotency_keys')
            .selectAll()
            .where('key', '=', key)
            .executeTakeFirst();
    }

    async save(data: NewIdempotencyKey) {
        return await db
            .insertInto('idempotency_keys')
            .values(data)
            .execute(); // No necesitamos retornar nada
    }
}

export const idempotencyRepository = new IdempotencyRepository();