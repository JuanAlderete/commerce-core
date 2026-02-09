import { Generated, Selectable, Insertable } from 'kysely';

export interface IdempotencyKeyTable {
    key: string;
    response_status: number;
    response_body: unknown; // JSONB
    request_path: string;
    request_params: unknown; // JSONB
    created_at: Generated<Date>;
}

export type IdempotencyKey = Selectable<IdempotencyKeyTable>;
export type NewIdempotencyKey = Insertable<IdempotencyKeyTable>;