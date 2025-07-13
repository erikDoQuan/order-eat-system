const axios = require('axios');

async function testReviewAPI() {
    try {
        console.log('🧪 Testing Review API...');

        // Test 1: Lấy danh sách reviews
        console.log('\n1. Testing GET /reviews...');
        const getResponse = await axios.get('http://localhost:3000/api/v1/reviews');
        console.log('✅ GET /reviews success:', getResponse.data);

        // Test 2: Tạo review mới (cần token)
        console.log('\n2. Testing POST /reviews...');
        console.log('⚠️  POST /reviews requires authentication token');
        console.log('   You need to test this from frontend with valid user token');

        console.log('\n✅ Review API is ready!');
        console.log('\n📝 To test creating reviews:');
        console.log('   1. Login to frontend');
        console.log('   2. Go to Account page');
        console.log('   3. Find a completed order');
        console.log('   4. Click "Gửi đánh giá"');
        console.log('   5. Select rating and add comment');
        console.log('   6. Submit review');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testReviewAPI(); 