import { betterAuth } from 'better-auth';
import { bearer } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@boilerplate/db';
import { usuarios, sessions, accounts, verifications } from '@boilerplate/db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: usuarios,
      session: sessions,
      account: accounts,
      verification: verifications,
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
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  user: {
    fields: {
      name: 'nombre',
      image: 'avatar',
    },
    additionalFields: {
      negocioId: {
        type: 'string',
        required: true,
        input: true,
      },
      rol: {
        type: 'string',
        required: true,
        defaultValue: 'staff',
        input: true,
      },
    },
  },
  plugins: [bearer()],
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];
