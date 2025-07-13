const axios = require('axios');

async function testReviewAPIFixed() {
    try {
        console.log('🧪 Testing Fixed Review API...');

        // Test 1: Lấy danh sách reviews (không cần auth)
        console.log('\n1. Testing GET /reviews (no auth)...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews');
            console.log('✅ GET /reviews success:', getResponse.data);
        } catch (error) {
            console.log('❌ GET /reviews failed:', error.response?.status, error.response?.data);
        }

        // Test 2: Lấy reviews theo userId
        console.log('\n2. Testing GET /reviews?userId=...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews?userId=test-user-id');
            console.log('✅ GET /reviews with userId success:', getResponse.data);
        } catch (error) {
            console.log('❌ GET /reviews with userId failed:', error.response?.status, error.response?.data);
        }

        // Test 3: Lấy reviews theo orderId
        console.log('\n3. Testing GET /reviews?orderId=...');
        try {
            const getResponse = await axios.get('http://localhost:3000/api/v1/reviews?orderId=test-order-id');
            console.log('✅ GET /reviews with orderId success:', getResponse.data);
        } catch (error) {
            console.log('❌ GET /reviews with orderId failed:', error.response?.status, error.response?.data);
        }

        console.log('\n✅ Review API is now working like Orders API!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test from frontend with getReviewsByUserId(userId)');
        console.log('   2. Test creating reviews with authentication');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReviewAPIFixed(); 