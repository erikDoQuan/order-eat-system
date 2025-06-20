import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { boolean, decimal, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
// import { orders } from './orders';
import { users } from './users';

export const payments = pgTable('payments', {
  ...baseColumns,
  //   orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('unpaid'),
});

// export const paymentsRelations = relations(payments, ({ one }) => ({
//   order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
//   createdByUser: one(users, { fields: [payments.createdBy], references: [users.id] }),
//   updatedByUser: one(users, { fields: [payments.updatedBy], references: [users.id] }),
// }));

export type Payment = InferSelectModel<typeof payments>;
export type PaymentInsert = InferInsertModel<typeof payments>;
export type PaymentUpdate = Partial<PaymentInsert>;
