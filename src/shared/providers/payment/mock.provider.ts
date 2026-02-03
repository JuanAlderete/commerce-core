import { PaymentProvider, PaymentResult } from './payment.provider.js';
import crypto from 'node:crypto';

export class MockPaymentProvider implements PaymentProvider {
    async processPayment(
        orderId: string,
        amount: number,
        currency: string
    ): Promise<PaymentResult> {

        // SIMULACIÓN DE LATENCIA (Los bancos tardan...)
        await new Promise(resolve => setTimeout(resolve, 500));

        // LÓGICA DE SIMULACIÓN:
        // Si el monto es igual a 66600 centavos ($666), simulamos error
        if (amount === 66600) {
            return {
                success: false,
                transactionId: '',
                error: 'Insufficient funds (Simulated)'
            };
        }

        // Caso de Éxito
        return {
            success: true,
            transactionId: `mock_${crypto.randomUUID()}`,
            metadata: {
                simulated_at: new Date().toISOString(),
                provider: 'MockBank'
            }
        };
    }
}

export const paymentProvider = new MockPaymentProvider();