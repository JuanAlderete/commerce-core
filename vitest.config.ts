import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config({ path: '.env.test' });

export default defineConfig({
  test: {
    fileParallelism: false, 
    hookTimeout: 30000,
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    isolate: false, 
  },
});