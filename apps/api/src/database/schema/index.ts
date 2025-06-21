// Import từng bảng
import { categories } from './categories';
import { dishes } from './dishes';
import { files } from './files';
import { payments } from './payments';
import { refreshTokens } from './refresh-tokens';
// import { reviews } from './reviews';
import { users } from './users';

// Export từng bảng để dùng riêng lẻ
export * from './_base';
export * from './categories';
export * from './dishes';
export * from './files';
export * from './payments';
export * from './refresh-tokens';
// export * from './reviews';
export * from './users';

// Export object tổng hợp cho Drizzle
export const schema = {
  categories,
  dishes,
  files,
  payments,
  refreshTokens,
  // reviews,
  users,
};
