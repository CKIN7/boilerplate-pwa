import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/boilerplate',
  },
  verbose: true,
  strict: true,
});