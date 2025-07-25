import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { decimal, json, pgEnum, pgTable, serial, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { reviews } from './reviews';
import { users } from './users';

// Enum trạng thái đơn hàng
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'delivering', 'completed', 'cancelled']);

// Enum hình thức nhận hàng
export const ORDER_TYPE_VALUES = ['pickup', 'delivery'] as const;
export type TypeOrderEnum = (typeof ORDER_TYPE_VALUES)[number];
export const orderTypeEnum = pgEnum('order_type', ORDER_TYPE_VALUES);
// Sử dụng ORDER_TYPE_VALUES để render select option hoặc validate ở backend/frontend

export const orders = pgTable('orders', {
  ...baseColumns,
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orderItems: json('order_items'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  status: orderStatusEnum('status').default('pending'),
  type: orderTypeEnum('type').default('delivery'),
  deliveryAddress: json('delivery_address'),
  note: varchar('note', { length: 255 }),
  pickupTime: varchar('pickup_time', { length: 20 }),
  updatedBy: uuid('updated_by').references(() => users.id, { onDelete: 'set null' }),
  appTransId: varchar('app_trans_id', { length: 32 }),
  zpTransToken: varchar('zp_trans_token', { length: 255 }),
  // returnCode: varchar('return_code', { length: 10 }), // Tạm thời comment để tránh lỗi
  orderNumber: serial('order_number'),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export type Order = InferSelectModel<typeof orders>;
export type OrderInsert = InferInsertModel<typeof orders>;
export type OrderUpdate = Partial<OrderInsert>;
