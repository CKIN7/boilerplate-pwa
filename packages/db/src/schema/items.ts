import { pgTable, uuid, varchar, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';
import { categorias } from './categorias';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  categoriaId: uuid('categoria_id').references(() => categorias.id, { onDelete: 'set null' }),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  descripcion: text('descripcion'),
  precio: integer('precio').notNull(),
  duracion: integer('duracion'),
  imagen: varchar('imagen', { length: 500 }),
  activo: boolean('activo').default(true),
  orden: integer('orden').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;