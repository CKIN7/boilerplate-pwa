import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  telefono: varchar('telefono', { length: 50 }),
  email: varchar('email', { length: 255 }),
  notas: text('notas'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Cliente = typeof clientes.$inferSelect;
export type NewCliente = typeof clientes.$inferInsert;