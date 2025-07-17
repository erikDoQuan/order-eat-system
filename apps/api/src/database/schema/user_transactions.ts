import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  uuid,
  decimal,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';
import { orders } from './orders';

// Enum trạng thái giao dịch
export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',     // Đang chờ
  'success',     // Thành công
  'failed',      // Thất bại
  'cancelled',   // Đã hủy
]);

// Enum phương thức thanh toán chỉ gồm tiền mặt và ZaloPay
export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'zalopay',
]);

export const userTransactions = pgTable('user_transactions', {
  ...baseColumns,

  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'set null' }),

  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),

  method: paymentMethodEnum('method').notNull(), // chỉ 'cash' hoặc 'zalopay'

  status: transactionStatusEnum('status')
    .default('pending')
    .notNull(),

  transTime: timestamp('trans_time', { withTimezone: true }).notNull(),

  transactionCode: varchar('transaction_code', { length: 64 }), // Mã giao dịch (ZaloPay)

  description: varchar('description', { length: 255 }),
});

export const userTransactionsRelations = relations(userTransactions, ({ one }) => ({
  user: one(users, {
    fields: [userTransactions.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [userTransactions.orderId],
    references: [orders.id],
  }),
}));

export type UserTransaction = InferSelectModel<typeof userTransactions>;
export type UserTransactionInsert = InferInsertModel<typeof userTransactions>;
export type UserTransactionUpdate = Partial<UserTransactionInsert>; 