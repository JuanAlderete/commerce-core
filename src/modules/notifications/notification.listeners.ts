import { eventBus } from '../../shared/events/event-bus.js';
import { notificationService } from './notification.service.js';
import { deadLetterQueue } from '../../shared/events/dead-letter-queue.js';

export function setupNotificationListeners() {

    async function withRetry<T>(
        fn: () => Promise<T>,
        maxRetries = 3,
        delay = 1000
    ): Promise<T> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
            }
        }
        throw new Error('Max retries exceeded');
    }

    eventBus.on('order.paid', async (payload) => {
        try {
            await withRetry(() =>
                notificationService.sendOrderConfirmation(payload.email!, payload.orderId, payload.total)
            );
        } catch (error) {
            // ✅ Guardar en cola de errores para procesamiento manual
            await deadLetterQueue.push({ event: 'order.paid', payload, error });
        }
    });
}