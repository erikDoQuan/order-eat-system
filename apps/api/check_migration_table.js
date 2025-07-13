const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://food_ordering_user:food_ordering_system_password@localhost:5432/food_ordering_system_local',
});

async function checkMigrationTable() {
    try {
        const client = await pool.connect();

        // Kiểm tra cấu trúc bảng drizzle_migrations
        const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'drizzle_migrations'
      ORDER BY ordinal_position;
    `);

        console.log('Cấu trúc bảng drizzle_migrations:');
        result.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });

        // Xem tất cả records trong bảng
        const records = await client.query('SELECT * FROM "drizzle_migrations"');
        console.log('\nCác migration records hiện tại:');
        records.rows.forEach(row => {
            console.log(row);
        });

        client.release();
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await pool.end();
    }
}

checkMigrationTable(); 