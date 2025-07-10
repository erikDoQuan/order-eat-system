import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { boolean, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';

import { USER_ROLE } from '~/modules/user/constants/users.constant';
import { baseColumns } from './_base';
import { refreshTokens } from './refresh-tokens';

export const userRoleEnum = pgEnum('user_role', [USER_ROLE.ADMIN, USER_ROLE.USER]);

export const users = pgTable('users', {
  ...baseColumns,
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  email: varchar('email').notNull().unique(),
  phoneNumber: varchar('phone_number'),
  address: varchar('address'),
  password: varchar('password').notNull(),
  lastLogin: timestamp('last_login', { withTimezone: true }),
  role: userRoleEnum('role').notNull().default(USER_ROLE.USER),
  avatar: varchar('avatar'),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));

export type User = InferSelectModel<typeof users>;
export type UserWithoutPassword = Omit<User, 'password'>;
export type UserInsert = InferInsertModel<typeof users>;
export type UserUpdate = Partial<UserInsert>;
