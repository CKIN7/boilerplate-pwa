import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';
import { reservas } from './reservas';

export const notificaciones = pgTable('notificaciones', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  reservaId: uuid('reserva_id').references(() => reservas.id, { onDelete: 'set null' }),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  canal: varchar('canal', { length: 20 }).notNull(),
  estado: varchar('estado', { length: 20 }).default('pendiente'),
  payload: jsonb('payload'),
  enviadoAt: timestamp('enviado_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Notificacion = typeof notificaciones.$inferSelect;
export type NewNotificacion = typeof notificaciones.$inferInsert;