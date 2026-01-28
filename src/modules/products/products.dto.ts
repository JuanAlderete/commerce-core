import { Type } from '@sinclair/typebox';

// Definimos el patrón exacto de un UUID v4
const UUID_PATTERN = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

export const CreateProductSchema = Type.Object({
    name: Type.String({ minLength: 3 }),
    slug: Type.String({ minLength: 3 }),
    description: Type.Optional(Type.String()),
    price: Type.Number({ minimum: 0 }),
    stock: Type.Integer({ minimum: 0 }),
    sku: Type.String({ minLength: 3 }),
    categoryId: Type.String({ pattern: UUID_PATTERN }),
    imageUrl: Type.Optional(Type.String({ format: 'uri' }))
});