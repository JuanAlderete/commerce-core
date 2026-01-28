import { Type, Static } from '@sinclair/typebox';

export const LoginSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
});

export type LoginBody = Static<typeof LoginSchema>;
