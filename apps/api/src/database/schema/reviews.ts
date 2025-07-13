import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  pgTable,
  smallint,
  text,
  uuid,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';
import { orders } from './orders';

export const reviews = pgTable('reviews', {
  ...baseColumns,
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  rating: smallint('rating').notNull(),
  comment: text('comment'),
}, (table) => ({
  orderIdUnique: uniqueIndex('reviews_order_id_unique').on(table.orderId),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  creator: one(users, {
    fields: [reviews.createdBy],
    references: [users.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;
export type ReviewUpdate = Partial<ReviewInsert>;
