import { logger } from '../logger/index.js';

export interface DeadLetterEntry {
    event: string;
    payload: unknown;
    error: unknown;
}

class DeadLetterQueue {
    /**
     * Pushes a failed event to the Dead Letter Queue.
     * Currently implemented as a structured error log.
     * In the future, this should persist to a database table or external queue service 
     * (e.g., SQS DLQ, Redis) for replay capabilities.
     */
    async push(entry: DeadLetterEntry): Promise<void> {
        logger.error({
            msg: 'DEAD_LETTER_QUEUE_DROP',
            event: entry.event,
            payload: entry.payload,
            err: entry.error, // pino standard for errors is 'err' or use a serializer
        }, 'Event dropped to Dead Letter Queue');
    }
}

export const deadLetterQueue = new DeadLetterQueue();
