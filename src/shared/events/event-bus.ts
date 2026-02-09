import EventEmitter from 'node:events';
import { logger } from '../logger/index.js';

// 1. Definimos los eventos posibles y su payload
export interface DomainEvents {
    'order.paid': { orderId: string; userId: string; email?: string; total: number };
    'user.registered': { userId: string; email: string };
}

// 2. Creamos la clase tipada
class TypedEventBus extends EventEmitter {
    emit<K extends keyof DomainEvents>(event: K, payload: DomainEvents[K]): boolean {
        logger.info({ event, payload }, '📢 Event Emitted');
        return super.emit(event, payload);
    }

    on<K extends keyof DomainEvents>(event: K, listener: (payload: DomainEvents[K]) => void): this {
        return super.on(event, listener);
    }
}

export const eventBus = new TypedEventBus();