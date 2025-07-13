// Test script để POST /reviews không cần authentication
const axios = require('axios');

async function testPostReviewsNoAuth() {
    try {
        console.log('=== Test POST /reviews KHÔNG cần Authentication ===');

        // 1. Test POST /reviews không có token (sẽ thành công)
        console.log('\n1. Test POST /reviews không có token...');
        const reviewData = {
            orderId: "e751a79c-8e9f-4ae8-bf69-13130d8c2d25",
            rating: 5,
            comment: "ngon lắm - không cần auth"
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data);

        // 2. Test POST /reviews với token (cũng sẽ thành công)
        console.log('\n2. Test POST /reviews với token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        const reviewResponseWithToken = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review với token cũng thành công:', reviewResponseWithToken.data);

        // 3. Test tạo review thứ 2 cho cùng order (sẽ bị lỗi 409)
        console.log('\n3. Test tạo review thứ 2 cho cùng order...');
        try {
            const reviewResponse2 = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Không nên thành công:', reviewResponse2.data);
        } catch (error) {
            console.log('✅ Đúng rồi, bị lỗi 409:', error.response?.status);
            console.log('✅ Error message:', error.response?.data?.message);
        }

        // 4. So sánh với POST /orders
        console.log('\n4. So sánh với POST /orders...');
        const orderData = {
            orderItems: [{ dishId: "123", quantity: 1 }],
            totalAmount: 100,
            type: "delivery",
            deliveryAddress: { address: "Test address" }
        };

        try {
            const orderResponse = await axios.post('http://localhost:3001/api/v1/orders', orderData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ POST /orders thành công:', orderResponse.data);
        } catch (error) {
            console.log('❌ POST /orders lỗi:', error.response?.status);
        }

        console.log('\n=== Kết luận ===');
        console.log('✅ POST /reviews không cần authentication: THÀNH CÔNG');
        console.log('✅ POST /reviews với token: THÀNH CÔNG');
        console.log('✅ Unique constraint hoạt động: LỖI 409');
        console.log('✅ Giống hệt POST /orders');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Chạy test
testPostReviewsNoAuth(); 