import { Type, Static } from '@sinclair/typebox';

// Patrón UUID para validación
const UUID_PATTERN = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

export const CreateOrderSchema = Type.Object({
    guestEmail: Type.Optional(Type.String({ format: 'email' })),
    items: Type.Array(
        Type.Object({
            productId: Type.String({ pattern: UUID_PATTERN }),
            quantity: Type.Integer({ minimum: 1 })
        }),
        { minItems: 1 }
    )
});

export type CreateOrderBody = Static<typeof CreateOrderSchema>;