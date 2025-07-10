// Import từng bảng
import { categories } from './categories';
import { dishes } from './dishes';
import { emailVerifications } from './email-verifications';
import { files } from './files';
import { orders } from './orders';
import { payments } from './payments';
import { refreshTokens } from './refresh-tokens';
import { reviews } from './reviews'; 
import { users } from './users';
import { dishSnapshots } from './dish_snapshot';

export * from './_base';
export * from './categories';
export * from './dishes';
export * from './email-verifications';
export * from './files';
export * from './payments';
export * from './refresh-tokens';
export * from './reviews'; 
export * from './users';
export * from './orders';
export * from './dish_snapshot';

export const schema = {
  categories,
  dishes,
  emailVerifications,
  files,
  payments,
  refreshTokens,
  reviews, 
  users,
  orders,
  dishSnapshots,
};
