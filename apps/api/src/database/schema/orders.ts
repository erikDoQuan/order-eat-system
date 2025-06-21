import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  json,
  decimal,
  varchar,
  uuid,
} from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';

// Enum trạng thái đơn hàng
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'delivering',
  'completed',
  'cancelled',
]);

export const orders = pgTable('orders', {
  ...baseColumns,
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderItems: json('order_items'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  status: orderStatusEnum('status').default('pending'),
});

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
}));

export type Order = InferSelectModel<typeof orders>;
export type OrderInsert = InferInsertModel<typeof orders>;
export type OrderUpdate = Partial<OrderInsert>;
