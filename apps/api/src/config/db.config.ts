import { registerAs } from '@nestjs/config';

export default registerAs('db', () => ({
  dbURL: process.env.DB_URL,
  ssl: process.env.DB_SSL === 'true',
  debugEnabled: process.env.DB_DEBUG === 'true',
}));
