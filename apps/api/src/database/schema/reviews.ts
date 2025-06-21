import { sql } from 'drizzle-orm';
import {
  pgTable,
  smallint,
  text,
  uuid,
} from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';
import { dishes } from './dishes';

export const reviews = pgTable('reviews', {
  ...baseColumns,
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  dishId: uuid('dish_id').references(() => dishes.id, { onDelete: 'set null' }),
  rating: smallint('rating').notNull(),
  comment: text('comment'),
});

export type Review = typeof reviews.$inferSelect;
export type ReviewInsert = typeof reviews.$inferInsert;
export type ReviewUpdate = Partial<ReviewInsert>;
