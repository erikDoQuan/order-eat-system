import * as path from 'path';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const main = async () => {
  console.log('Running migrations...');
  console.log('DB URL:', process.env.DB_URL ? 'Configured' : 'Missing');

  const pool = new Pool({
    connectionString: process.env.DB_URL,
  });

  // Test connection
  const client = await pool.connect();
  console.log('Database connection successful');
  client.release();

  // Try to get migration meta info
  try {
    const metaResult = await pool.query(`SELECT * FROM "public"."drizzle_migrations" LIMIT 1`);
    console.log('Drizzle migrations table exists:', metaResult.rowCount >= 0);
  } catch (e) {
    console.log('Drizzle migrations table does not exist yet, will be created');
  }

  try {
    const db = drizzle(pool);
    await pool.query('BEGIN');

    // Set specific options for migration
    await migrate(db, {
      migrationsFolder: 'src/database/migrations',
      migrationsSchema: 'public',
      migrationsTable: 'drizzle_migrations',
    });

    await pool.query('COMMIT');

    console.log('Migrations completed!');
  } catch (err) {
    console.error('Migration error:', err);
    await pool.query('ROLLBACK');
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main().catch(err => {
  console.error('Migration failed!', err);
  process.exit(1);
});
