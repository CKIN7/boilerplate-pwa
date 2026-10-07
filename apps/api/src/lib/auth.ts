import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@boilerplate/db';
import { usuarios } from '@boilerplate/db/schema/usuarios';
import { negocios } from '@boilerplate/db/schema/negocios';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: usuarios,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      negocioId: {
        type: 'string',
        required: true,
        input: false,
      },
      rol: {
        type: 'string',
        required: true,
        defaultValue: 'staff',
        input: false,
      },
    },
  },
  plugins: [],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;