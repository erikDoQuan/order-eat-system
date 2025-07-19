import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { decimal, text, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseTable } from './_base';
import { categories } from './categories';
import { dishes, dishSizeEnum, dishStatusEnum } from './dishes';
import { users } from './users';

export const dishSnapshots = baseTable('dish_snapshots', {
  dishId: uuid('dish_id')
    .references(() => dishes.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  status: dishStatusEnum('status').default('available'),
  size: dishSizeEnum('size'),
  typeName: varchar('type_name', { length: 100 }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdBy: uuid('created_by')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  updatedBy: uuid('updated_by')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
});

export const dishSnapshotsRelations = relations(dishSnapshots, ({ one }) => ({
  dish: one(dishes, {
    fields: [dishSnapshots.dishId],
    references: [dishes.id],
  }),
  category: one(categories, {
    fields: [dishSnapshots.categoryId],
    references: [categories.id],
  }),
  createdByUser: one(users, {
    fields: [dishSnapshots.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [dishSnapshots.updatedBy],
    references: [users.id],
  }),
}));

export type DishSnapshot = InferSelectModel<typeof dishSnapshots>;
export type DishSnapshotInsert = InferInsertModel<typeof dishSnapshots>;
export type DishSnapshotUpdate = Partial<DishSnapshotInsert> & { isActive?: boolean };
