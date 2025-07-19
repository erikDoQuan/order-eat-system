import { categories } from './categories';
import { dishSnapshots } from './dish_snapshot';
import { dishes } from './dishes';
import { emailVerifications } from './email-verifications';
import { files } from './files';
import { orders } from './orders';
import { payments } from './payments';
import { refreshTokens } from './refresh-tokens';
import { reviews } from './reviews';
import { users } from './users';

export * from './_base';
export * from './categories';
export * from './dishes';
export * from './dish_snapshot';
export * from './email-verifications';
export * from './files';
export * from './orders';
export * from './payments';
export * from './refresh-tokens';
export * from './reviews';
export * from './users';

export const schema = {
  categories,
  dishes,
  dishSnapshots,
  emailVerifications,
  files,
  orders,
  payments,
  refreshTokens,
  reviews,
  users,
};
