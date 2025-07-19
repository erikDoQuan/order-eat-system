import { InferSelectModel, relations } from 'drizzle-orm';
import { boolean, decimal, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { dishes } from './dishes';

export const dishOptions = pgTable('dish_options', {
  ...baseColumns,
  dishId: uuid('dish_id')
    .references(() => dishes.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00'),
  description: text('description'),
  isRequired: boolean('is_required').default(false),
});

export const dishOptionsRelations = relations(dishOptions, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishOptions.dishId],
    references: [dishes.id],
  }),
}));

export type DishOption = InferSelectModel<typeof dishOptions>;
