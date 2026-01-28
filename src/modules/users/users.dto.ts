import { Type, Static } from '@sinclair/typebox';

export const CreateUserSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 6 }),
    fullName: Type.String({ minLength: 2 })
});

export const LoginUserSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
});

export const UpdateUserSchema = Type.Object({
    email: Type.Optional(Type.String({ format: 'email' })),
    password: Type.Optional(Type.String({ minLength: 6 })),
    fullName: Type.Optional(Type.String({ minLength: 2 }))
});

export type CreateUserBody = Static<typeof CreateUserSchema>;
export type LoginUserBody = Static<typeof LoginUserSchema>;
export type UpdateUserBody = Static<typeof UpdateUserSchema>;
