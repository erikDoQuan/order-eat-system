// Import all schema definitions
import { categories } from './categories';
import { dishes } from './dishes';
import { files } from './files';
import { refreshTokens } from './refresh-tokens';
import { users } from './users';

// import { payments } from './payments';
// import { reviews } from './reviews';

// Export each individual schema for external usage
export * from './_base';
export * from './users';
export * from './refresh-tokens';
export * from './files';
export * from './categories';
export * from './dishes';
// export * from './payments';
// export * from './reviews';

// Export schema object for Drizzle usage (migrations, introspection, etc.)
export const schema = {
  users,
  refreshTokens,
  files,
  categories,
  dishes,
};
