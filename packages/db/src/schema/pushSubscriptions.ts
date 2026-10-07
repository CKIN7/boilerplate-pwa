import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { usuarios } from './usuarios';
import { negocios } from './negocios';

export const pushSubscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => usuarios.id, { onDelete: 'cascade' }).notNull(),
  negocioId: uuid('negocio_id').references(() => negocios.id, { onDelete: 'cascade' }).notNull(),
  endpoint: varchar('endpoint', { length: 500 }).notNull().unique(),
  p256dh: varchar('p256dh', { length: 200 }).notNull(),
  auth: varchar('auth', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert;