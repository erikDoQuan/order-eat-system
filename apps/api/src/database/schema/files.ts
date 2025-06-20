import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { bigint, boolean, pgTable, varchar } from 'drizzle-orm/pg-core';

import { baseColumns } from '~/database/schema/_base';
import { FILE_STATUS } from '~/modules/files/constants/files.constant';

export const files = pgTable('files', {
  ...baseColumns,
  name: varchar('name', { length: 255 }).notNull(),
  uniqueName: varchar('unique_name', { length: 255 }).notNull(),
  caption: varchar('caption', { length: 255 }),
  ext: varchar('ext', { length: 5 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  mime: varchar('mime', { length: 50 }).notNull(),
  isTemp: boolean('is_temp').notNull().default(true),
  status: varchar('status', { length: 50 }).notNull().default(FILE_STATUS.PUBLISHED),
});

export type File = InferSelectModel<typeof files>;
export type FileInsert = InferInsertModel<typeof files>;
export type FileUpdate = Partial<FileInsert>;
