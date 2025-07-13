const axios = require('axios');

async function debugReviewAPI() {
    try {
        console.log('🔍 Debugging Review API...');

        // Test 1: Kiểm tra GET /reviews không cần auth
        console.log('\n1. Testing GET /reviews (no auth)...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews');
            console.log('✅ GET /reviews success:', getResponse.data);
        } catch (error) {
            console.log('❌ GET /reviews failed:', error.response?.status, error.response?.data);
        }

        // Test 2: Kiểm tra POST /reviews với invalid data
        console.log('\n2. Testing POST /reviews (no auth)...');
        try {
            const postResponse = await axios.post('http://localhost:3000/api/v1/reviews', {
                orderId: 'test-order-id',
                rating: 5,
                comment: 'Test review'
            });
            console.log('✅ POST /reviews success:', postResponse.data);
        } catch (error) {
            console.log('❌ POST /reviews failed:', error.response?.status, error.response?.data);
            if (error.response?.status === 401) {
                console.log('   → This is expected: POST requires authentication');
            }
        }

        // Test 3: Kiểm tra database connection
        console.log('\n3. Testing database connection...');
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: 'postgresql://food_ordering_user:food_ordering_system_password@localhost:5432/food_ordering_system_local',
        });

        try {
            const client = await pool.connect();

            // Kiểm tra bảng reviews
            const reviewsResult = await client.query('SELECT * FROM reviews LIMIT 5');
            console.log('✅ Reviews table exists, records:', reviewsResult.rows.length);

            // Kiểm tra cấu trúc bảng
            const structureResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        ORDER BY ordinal_position
      `);
            console.log('📋 Reviews table structure:');
            structureResult.rows.forEach(row => {
                console.log(`   - ${row.column_name}: ${row.data_type}`);
            });

            // Kiểm tra bảng orders
            const ordersResult = await client.query('SELECT id FROM orders LIMIT 5');
            console.log('✅ Orders table exists, records:', ordersResult.rows.length);

            client.release();
            await pool.end();

        } catch (dbError) {
            console.log('❌ Database connection failed:', dbError.message);
        }

        console.log('\n📝 Debug Summary:');
        console.log('   1. If GET /reviews works → API is running');
        console.log('   2. If POST /reviews returns 401 → Auth is working');
        console.log('   3. If database connection works → DB is accessible');
        console.log('   4. Check if order_id column exists in reviews table');

    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

debugReviewAPI(); 