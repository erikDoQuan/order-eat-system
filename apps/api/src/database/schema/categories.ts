import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { dishes } from './dishes';
import { users } from './users';

export const categoryStatusEnum = pgEnum('category_status', ['active', 'inactive']);

export const categories = pgTable('categories', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  status: categoryStatusEnum('status').notNull().default('active'),
});

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [categories.updatedBy],
    references: [users.id],
  }),
  dishes: many(dishes),
}));

export type Category = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;
export type CategoryUpdate = Partial<CategoryInsert>;
