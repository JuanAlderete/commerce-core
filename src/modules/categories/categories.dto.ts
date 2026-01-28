import { Type, Static } from '@sinclair/typebox';

const UUID_PATTERN = '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

export const CreateCategorySchema = Type.Object({
    name: Type.String({ minLength: 2 }),
    slug: Type.String({ minLength: 2 }),
    description: Type.Optional(Type.String()),
    parentId: Type.Optional(Type.String({ pattern: UUID_PATTERN }))
});

export type CreateCategoryBody = Static<typeof CreateCategorySchema>;
