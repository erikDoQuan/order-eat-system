import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../src/database/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '../src/common/utils/password.util';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function hashExistingPasswords() {
  // Kết nối DB thủ công
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const { users } = schema;

  try {
    // Lấy tất cả user
    const allUsers = await db.select().from(users);
    // Lọc user có password chưa hash
    const usersToHash = allUsers.filter(u =>
      typeof u.password === 'string' &&
      !u.password.startsWith('$argon2id$') &&
      !u.password.startsWith('$2a$') &&
      !u.password.startsWith('$2b$') &&
      !u.password.startsWith('$2y$')
    );
    console.log(`Found ${usersToHash.length} users with unhashed passwords:`);
    for (const user of usersToHash) {
      console.log(`- ${user.email}: ${user.password}`);
    }
    if (usersToHash.length === 0) {
      console.log('All passwords are already hashed!');
      await pool.end();
      return;
    }
    // Hash password cho từng user
    for (const user of usersToHash) {
      const hashedPassword = await hashPassword(user.password);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, user.id));
      console.log(`✓ Hashed password for ${user.email}`);
    }
    console.log('✅ All passwords have been hashed successfully!');
  } catch (error) {
    console.error('❌ Error hashing passwords:', error);
  } finally {
    await pool.end();
  }
}

hashExistingPasswords().catch(console.error); 