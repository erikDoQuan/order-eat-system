const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://food_ordering_user:food_ordering_system_password@localhost:5432/food_ordering_system_local',
});

async function deleteMigration() {
    try {
        const client = await pool.connect();

        // Xóa record migration cũ
        const result = await client.query(
            'DELETE FROM "drizzle_migrations" WHERE "name" = $1',
            ['0017_damp_fallen_one.sql']
        );

        console.log(`Đã xóa ${result.rowCount} record migration cũ`);

        // Kiểm tra xem còn record nào không
        const checkResult = await client.query(
            'SELECT * FROM "drizzle_migrations" WHERE "name" = $1',
            ['0017_damp_fallen_one.sql']
        );

        if (checkResult.rows.length === 0) {
            console.log('✅ Migration cũ đã được xóa thành công!');
        } else {
            console.log('❌ Vẫn còn record migration cũ');
        }

        client.release();
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await pool.end();
    }
}

deleteMigration(); 