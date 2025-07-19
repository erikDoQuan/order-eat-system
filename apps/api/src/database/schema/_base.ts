import { boolean, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

export const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

export function baseTable<TName extends string, TColumns extends Record<string, any>>(
  name: TName,
  columns: TColumns,
  extra?: Parameters<typeof pgTable>[2],
) {
  return pgTable(name, { ...baseColumns, ...columns }, extra);
}
