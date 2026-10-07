import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';

export const rolEnum = pgEnum('rol', ['owner', 'staff', 'cliente']);

export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  rol: rolEnum('rol').default('staff'),
  nombre: varchar('nombre', { length: 100 }),
  avatar: varchar('avatar', { length: 500 }),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Usuario = typeof usuarios.$inferSelect;
export type NewUsuario = typeof usuarios.$inferInsert;