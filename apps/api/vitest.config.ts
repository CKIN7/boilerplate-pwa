import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@boilerplate/db': path.resolve(__dirname, '../../packages/db/src'),
      '@boilerplate/config': path.resolve(__dirname, '../../packages/config/src'),
      '@boilerplate/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});