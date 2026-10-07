import { pgTable, uuid, varchar, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { negocios } from './negocios';
import { clientes } from './clientes';
import { items } from './items';

export const estadoReservaEnum = pgEnum('estado_reserva', ['pendiente', 'confirmada', 'cancelada', 'completada', 'no_show']);

export const reservas = pgTable('reservas', {
  id: uuid('id').primaryKey().defaultRandom(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  clienteId: uuid('cliente_id').references(() => clientes.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),
  fechaInicio: timestamp('fecha_inicio').notNull(),
  fechaFin: timestamp('fecha_fin').notNull(),
  estado: estadoReservaEnum('estado').default('pendiente'),
  notas: text('notas'),
  origen: varchar('origen', { length: 50 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Reserva = typeof reservas.$inferSelect;
export type NewReserva = typeof reservas.$inferInsert;