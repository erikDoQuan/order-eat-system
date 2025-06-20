// import { pgTable, integer, smallint, text, boolean, timestamp } from 'drizzle-orm/pg-core';
// import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';

// import { baseColumns } from './_base';
// import { users } from './users';
// import { dishes } from './dishes';

// export const reviews = pgTable('reviews', {
//   ...baseColumns,
//   userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
//   dishId: integer('dish_id').references(() => dishes.id, { onDelete: 'set null' }),
//   rating: smallint('rating').notNull(),
//   comment: text('comment'),
//   isActive: boolean('is_active').default(true),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
//   createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
//   updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
//   updatedAt: timestamp('updated_at', { withTimezone: true }),
// });

// export const reviewsRelations = relations(reviews, ({ one }) => ({
//   user: one(users, { fields: [reviews.userId], references: [users.id] }),
//   dish: one(dishes, { fields: [reviews.dishId], references: [dishes.id] }),
// }));

// export type Review = InferSelectModel<typeof reviews>;
// export type ReviewInsert = InferInsertModel<typeof reviews>;
// export type ReviewUpdate = Partial<ReviewInsert>;
