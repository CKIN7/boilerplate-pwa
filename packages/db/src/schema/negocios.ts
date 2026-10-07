import { pgTable, uuid, varchar, text, jsonb, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const rubroEnum = pgEnum('rubro', ['restaurante', 'clinica', 'barberia', 'gimnasio', 'tienda', 'otro']);
export const planEnum = pgEnum('plan', ['starter', 'pro', 'enterprise']);

export const negocios = pgTable('negocios', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).unique().notNull(),
  nombre: varchar('nombre', { length: 200 }).notNull(),
  rubro: rubroEnum('rubro').notNull(),
  configJson: jsonb('config_json').notNull(),
  plan: planEnum('plan').default('starter'),
  activo: boolean('activo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Negocio = typeof negocios.$inferSelect;
export type NewNegocio = typeof negocios.$inferInsert;