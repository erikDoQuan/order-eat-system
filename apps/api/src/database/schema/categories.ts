import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { pgEnum, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { dishes } from './dishes';
import { users } from './users';

// Enum trạng thái danh mục
export const categoryStatusEnum = pgEnum('category_status', ['active', 'inactive']);

// Bảng categories
export const categories = pgTable('categories', {
  ...baseColumns,
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  status: categoryStatusEnum('status').notNull().default('active'),
});

// Quan hệ
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

// Kiểu dữ liệu
export type Category = InferSelectModel<typeof categories>;
export type CategoryInsert = InferInsertModel<typeof categories>;
export type CategoryUpdate = Partial<CategoryInsert>;
