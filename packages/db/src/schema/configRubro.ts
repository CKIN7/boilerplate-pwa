import { pgTable, uuid, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';

export const configRubro = pgTable('config_rubro', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  clave: varchar('clave', { length: 100 }).notNull(),
  valorJson: jsonb('valor_json').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type ConfigRubro = typeof configRubro.$inferSelect;
export type NewConfigRubro = typeof configRubro.$inferInsert;