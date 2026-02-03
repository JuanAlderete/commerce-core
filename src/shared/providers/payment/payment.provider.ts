export interface PaymentResult {
    success: boolean;
    transactionId: string; // ID externo (ej: 'stripe_ch_123' o 'mock_999')
    metadata?: any;        // Datos extra (JSON crudo del proveedor)
    error?: string;
}

// El contrato que todos deben firmar
export interface PaymentProvider {
    /**
     * Intenta cobrar un monto específico a una tarjeta/token.
     * @param orderId ID interno de nuestra orden
     * @param amount Monto en CENTAVOS (Integers)
     * @param currency Moneda (USD, ARS)
     * @param paymentToken Token de la tarjeta (en simulación puede ser null)
     */
    processPayment(
        orderId: string,
        amount: number,
        currency: string,
        paymentToken?: string
    ): Promise<PaymentResult>;
}