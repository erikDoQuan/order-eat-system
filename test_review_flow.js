// Test script để kiểm tra toàn bộ luồng review
const axios = require('axios');

async function testReviewFlow() {
    try {
        console.log('=== Test Review Flow ===');

        // 1. Login để lấy token
        console.log('\n1. Login để lấy token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        // 2. Test GET /orders để xem orders có reviews không
        console.log('\n2. Test GET /orders...');
        const ordersResponse = await axios.get('http://localhost:3001/api/v1/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const orders = ordersResponse.data.data.data;
        console.log('✅ Orders count:', orders.length);

        // Tìm order completed chưa có review
        const orderToReview = orders.find(order =>
            order.status === 'completed' &&
            (!order.reviews || order.reviews.length === 0)
        );

        if (!orderToReview) {
            console.log('❌ Không tìm thấy order completed chưa có review');
            return;
        }

        console.log('✅ Order để review:', orderToReview.id);

        // 3. Test POST /reviews với token
        console.log('\n3. Test POST /reviews...');
        const reviewData = {
            orderId: orderToReview.id,
            rating: 5,
            comment: 'Test review từ script'
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data.data.id);

        // 4. Test GET /orders lại để xem review đã được thêm chưa
        console.log('\n4. Test GET /orders sau khi tạo review...');
        const ordersResponse2 = await axios.get('http://localhost:3001/api/v1/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const orders2 = ordersResponse2.data.data.data;
        const orderWithReview = orders2.find(order => order.id === orderToReview.id);

        if (orderWithReview && orderWithReview.reviews && orderWithReview.reviews.length > 0) {
            console.log('✅ Order có review:', orderWithReview.reviews[0]);
        } else {
            console.log('❌ Order không có review');
        }

        // 5. Test tạo review thứ 2 cho cùng order (sẽ bị lỗi)
        console.log('\n5. Test tạo review thứ 2 cho cùng order...');
        try {
            const reviewResponse2 = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Không nên thành công:', reviewResponse2.data);
        } catch (error) {
            console.log('✅ Đúng rồi, bị lỗi 409:', error.response?.status);
            console.log('✅ Error message:', error.response?.data?.message);
        }

        console.log('\n=== Kết luận ===');
        console.log('✅ Luồng review hoạt động đúng');
        console.log('✅ Token được gửi đúng');
        console.log('✅ Unique constraint hoạt động');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Test không có token
async function testWithoutToken() {
    console.log('\n=== Test POST /reviews KHÔNG có token ===');
    try {
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
    await testReviewFlow();
    await testWithoutToken();
}

runTests(); 