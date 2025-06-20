import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { categories } from './categories';
import { users } from './users';

// import { reviews } from './reviews';

export const dishStatusEnum = pgEnum('dish_status', ['available', 'unavailable']);
export const dishSizeEnum = pgEnum('dish_size', ['small', 'medium', 'large']);

export const dishes = pgTable('dishes', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  status: dishStatusEnum('status').default('available'),
  typeName: varchar('type_name', { length: 100 }),
  size: dishSizeEnum('size'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
});

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  category: one(categories, { fields: [dishes.categoryId], references: [categories.id] }),
  createdByUser: one(users, { fields: [dishes.createdBy], references: [users.id] }),
  updatedByUser: one(users, { fields: [dishes.updatedBy], references: [users.id] }),
  //   reviews: many(reviews),
}));

export type Dish = InferSelectModel<typeof dishes>;
export type DishInsert = InferInsertModel<typeof dishes>;
export type DishUpdate = Partial<DishInsert>;
