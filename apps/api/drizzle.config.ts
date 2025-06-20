import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schema/*.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL,
  },
  verbose: process.env.DB_DEBUG === 'true',
  strict: true,
} satisfies Config;
