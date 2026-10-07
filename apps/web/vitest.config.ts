import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@boilerplate/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@boilerplate/config': path.resolve(__dirname, '../../packages/config/src'),
      '@boilerplate/db': path.resolve(__dirname, '../../packages/db/src'),
      '@boilerplate/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
});