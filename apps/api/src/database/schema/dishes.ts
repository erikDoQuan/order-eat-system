import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { decimal, pgEnum, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { DISH_SIZE, DISH_STATUS } from '~/modules/dish/constant/dish.constant';
import { baseColumns } from './_base';
import { categories } from './categories';
import { users } from './users';

export const dishStatusEnum = pgEnum('dish_status', [DISH_STATUS.AVAILABLE, DISH_STATUS.UNAVAILABLE, DISH_STATUS.COMING_SOON]);
export const dishSizeEnum = pgEnum('dish_size', [DISH_SIZE.SMALL, DISH_SIZE.MEDIUM, DISH_SIZE.LARGE]);

export const dishes = pgTable('dishes', {
  ...baseColumns,
  createdBy: uuid('created_by')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  updatedBy: uuid('updated_by')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  status: dishStatusEnum('status').default('available'),
  typeName: varchar('type_name', { length: 100 }),
  size: dishSizeEnum('size'),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
});

export const dishesRelations = relations(dishes, ({ one }) => ({
  category: one(categories, {
    fields: [dishes.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [dishes.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [dishes.updatedBy],
    references: [users.id],
  }),
}));

export type Dish = InferSelectModel<typeof dishes>;
export type DishWithoutPrice = Omit<Dish, 'basePrice'>;
export type DishInsert = InferInsertModel<typeof dishes>;
export type DishUpdate = Partial<DishInsert> & { isActive?: boolean };
