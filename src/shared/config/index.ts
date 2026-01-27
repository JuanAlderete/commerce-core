import 'dotenv/config';
import envSchema from 'env-schema';
import { type Static, Type } from '@sinclair/typebox';

const schema = Type.Object({
  NODE_ENV: Type.String({
    default: 'development',
    enum: ['development', 'production', 'test'],
  }),
  PORT: Type.Number({ default: 3000 }),
  DATABASE_URL: Type.String(),
  LOG_LEVEL: Type.String({
    default: 'info',
    enum: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
  }),
});

type Env = Static<typeof schema>;

export const config = envSchema<Env>({
  schema,
  dotenv: true,
});
