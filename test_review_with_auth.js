// Test script để kiểm tra POST /reviews với authentication
const axios = require('axios');

async function testReviewWithAuth() {
    try {
        // 1. Login để lấy token
        console.log('1. Đăng nhập để lấy token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        // 2. Test POST /reviews với token
        console.log('\n2. Test POST /reviews với token...');
        const reviewData = {
            orderId: '123e4567-e89b-12d3-a456-426614174000', // Thay bằng orderId thật
            rating: 5,
            comment: 'Món ăn rất ngon!'
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data);

        // 3. Kiểm tra review có userId và createdBy không
        console.log('\n3. Kiểm tra review có userId và createdBy...');
        const createdReview = reviewResponse.data.data;
        console.log('userId:', createdReview.userId);
        console.log('createdBy:', createdReview.createdBy);

        // 4. Test GET /reviews để xem review mới
        console.log('\n4. Test GET /reviews...');
        const getReviewsResponse = await axios.get('http://localhost:3001/api/v1/reviews');
        console.log('✅ Danh sách reviews:', getReviewsResponse.data.data.data.length, 'reviews');

        // 5. Test GET /orders để xem order có review không
        console.log('\n5. Test GET /orders...');
        const getOrdersResponse = await axios.get('http://localhost:3001/api/v1/orders');
        console.log('✅ Danh sách orders:', getOrdersResponse.data.data.data.length, 'orders');

        // Tìm order có review
        const ordersWithReviews = getOrdersResponse.data.data.data.filter(order => order.reviews && order.reviews.length > 0);
        console.log('Orders có reviews:', ordersWithReviews.length);

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Test không có token
async function testReviewWithoutAuth() {
    try {
        console.log('\n=== Test POST /reviews KHÔNG có token ===');
        const reviewData = {
            orderId: '123e4567-e89b-12d3-a456-426614174000',
            rating: 5,
            comment: 'Test không có token'
        };

        const response = await axios.post('http://localhost:3001/api/v1/reviews', reviewData);
        console.log('❌ Không nên thành công:', response.data);
    } catch (error) {
        console.log('✅ Đúng rồi, bị lỗi 401:', error.response?.status);
    }
}

// Chạy test
async function runTests() {
    await testReviewWithAuth();
    await testReviewWithoutAuth();
}

runTests(); 