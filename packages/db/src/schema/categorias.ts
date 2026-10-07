import { pgTable, uuid, varchar, text, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';

export const categorias = pgTable('categorias', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  nombre: varchar('nombre', { length: 100 }).notNull(),
  descripcion: text('descripcion'),
  orden: integer('orden').default(0),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Categoria = typeof categorias.$inferSelect;
export type NewCategoria = typeof categorias.$inferInsert;