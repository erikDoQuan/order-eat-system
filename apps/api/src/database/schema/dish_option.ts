import { InferSelectModel, relations } from 'drizzle-orm';
import { boolean, decimal, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { dishes } from './dishes';

// Bảng dish_options
export const dishOptions = pgTable('dish_options', {
  ...baseColumns,
  dishId: uuid('dish_id')
    .references(() => dishes.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).default('0.00'),
  description: text('description'),
  isRequired: boolean('is_required').default(false),
});

// Quan hệ cho bảng dish_options
export const dishOptionsRelations = relations(dishOptions, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishOptions.dishId],
    references: [dishes.id],
  }),
}));

// Kiểu dữ liệu xuất/ghi cho dish_options
export type DishOption = InferSelectModel<typeof dishOptions>;
