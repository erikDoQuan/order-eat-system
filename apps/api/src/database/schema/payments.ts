import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { boolean, decimal, integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';

export const payments = pgTable('payments', {
  ...baseColumns,
  paymentMethod: varchar('payment_method', { length: 50 }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('unpaid'),
});

export type Payment = InferSelectModel<typeof payments>;
export type PaymentInsert = InferInsertModel<typeof payments>;
export type PaymentUpdate = Partial<PaymentInsert>;
