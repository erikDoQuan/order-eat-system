import * as path from 'path';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const main = async () => {
  const pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  try {
    // Test connection
    const client = await pool.connect();
    client.release();

    // Optional: log nếu cần kiểm tra bảng drizzle_migrations
    try {
      const metaResult = await pool.query(`SELECT * FROM "public"."drizzle_migrations" LIMIT 1`);
      console.log('✅ drizzle_migrations table exists');
    } catch (e) {
      console.warn('⚠️ drizzle_migrations table not found or cannot be queried');
    }

    const db = drizzle(pool);
    await pool.query('BEGIN');

    await migrate(db, {
      migrationsFolder: 'src/database/migrations',
      migrationsSchema: 'public',
      migrationsTable: 'drizzle_migrations',
    });

    await pool.query('COMMIT');
    console.log('✅ Migrations complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    await pool.query('ROLLBACK');
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main().catch(err => {
  console.error('❌ Uncaught migration error:', err);
  process.exit(1);
});
