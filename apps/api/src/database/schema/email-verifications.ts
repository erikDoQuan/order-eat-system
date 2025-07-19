import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from './_base';
import { users } from './users';

export const emailVerifications = pgTable('email_verifications', {
  ...baseColumns,
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: varchar('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
});

export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));

export type EmailVerification = InferSelectModel<typeof emailVerifications>;
export type EmailVerificationInsert = InferInsertModel<typeof emailVerifications>;
export type EmailVerificationUpdate = Partial<EmailVerificationInsert>;
