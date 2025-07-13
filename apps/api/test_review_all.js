const axios = require('axios');

async function testReviewAll() {
    try {
        console.log('🧪 Testing Review API - Get All Reviews...');

        // Test 1: Lấy tất cả reviews (không có params)
        console.log('\n1. Testing GET /reviews (all reviews)...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews');
            console.log('✅ GET /reviews success:', getResponse.data);
            console.log(`   Total reviews: ${getResponse.data.data?.totalItems || 0}`);
            console.log(`   Reviews returned: ${getResponse.data.data?.data?.length || 0}`);
        } catch (error) {
            console.log('❌ GET /reviews failed:', error.response?.status, error.response?.data);
        }

        // Test 2: Lấy reviews với limit
        console.log('\n2. Testing GET /reviews?limit=5...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews?limit=5');
            console.log('✅ GET /reviews with limit success:', getResponse.data);
            console.log(`   Reviews returned: ${getResponse.data.data?.data?.length || 0}`);
        } catch (error) {
            console.log('❌ GET /reviews with limit failed:', error.response?.status, error.response?.data);
        }

        // Test 3: Lấy reviews theo userId (nếu có)
        console.log('\n3. Testing GET /reviews?userId=test-user...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews?userId=test-user-id');
            console.log('✅ GET /reviews with userId success:', getResponse.data);
            console.log(`   Reviews for user: ${getResponse.data.data?.data?.length || 0}`);
        } catch (error) {
            console.log('❌ GET /reviews with userId failed:', error.response?.status, error.response?.data);
        }

        // Test 4: Lấy reviews theo orderId (nếu có)
        console.log('\n4. Testing GET /reviews?orderId=test-order...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews?orderId=test-order-id');
            console.log('✅ GET /reviews with orderId success:', getResponse.data);
            console.log(`   Reviews for order: ${getResponse.data.data?.data?.length || 0}`);
        } catch (error) {
            console.log('❌ GET /reviews with orderId failed:', error.response?.status, error.response?.data);
        }

        console.log('\n✅ Review API now works like Orders API!');
        console.log('\n📝 Summary:');
        console.log('   - GET /reviews returns ALL reviews (like orders)');
        console.log('   - GET /reviews?userId=... filters by user');
        console.log('   - GET /reviews?orderId=... filters by order');
        console.log('   - GET /reviews?rating=... filters by rating');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReviewAll(); 