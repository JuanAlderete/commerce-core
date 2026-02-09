import { logger } from '../../shared/logger/index.js';

export class NotificationService {
    async sendOrderConfirmation(email: string, orderId: string, total: number) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Aquí iría la llamada a SendGrid / AWS SES / Resend
        logger.info(
            `📧 EMAIL SENT to ${email}: "Order ${orderId} confirmed! Total: $${total / 100}"`
        );
    }
}

export const notificationService = new NotificationService();