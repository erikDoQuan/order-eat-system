// import { pgTable, integer, json, decimal, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
// import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';

// import { baseColumns } from './_base';
// import { users } from './users';
// import { payments } from './payments';

// export const orders = pgTable('orders', {
//   ...baseColumns,
//   userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
//   orderItems: json('order_items'),
//   totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
//   status: varchar('status', { length: 50 }).default('pending'),
//   isActive: boolean('is_active').default(true),
//   createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
//   createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
//   updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
//   updatedAt: timestamp('updated_at', { withTimezone: true }),
// });

// export const ordersRelations = relations(orders, ({ one, many }) => ({
//   user: one(users, { fields: [orders.userId], references: [users.id] }),
//   payments: many(payments),
// }));

// export type Order = InferSelectModel<typeof orders>;
// export type OrderInsert = InferInsertModel<typeof orders>;
// export type OrderUpdate = Partial<OrderInsert>;
