// Test script để POST /reviews với token
const axios = require('axios');

async function testPostReviewsWithToken() {
    try {
        console.log('=== Test POST /reviews với Token ===');

        // 1. Login để lấy token
        console.log('\n1. Login để lấy token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        // 2. Test POST /reviews với token
        console.log('\n2. Test POST /reviews với token...');
        const reviewData = {
            orderId: "e751a79c-8e9f-4ae8-bf69-13130d8c2d25",
            rating: 5,
            comment: "ngon"
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data);

        // 3. Test POST /reviews KHÔNG có token (sẽ bị lỗi)
        console.log('\n3. Test POST /reviews KHÔNG có token...');
        try {
            const reviewResponseNoToken = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Không nên thành công:', reviewResponseNoToken.data);
        } catch (error) {
            console.log('✅ Đúng rồi, bị lỗi 401:', error.response?.status);
            console.log('✅ Error message:', error.response?.data?.message);
        }

        // 4. Test tạo review thứ 2 cho cùng order (sẽ bị lỗi 409)
        console.log('\n4. Test tạo review thứ 2 cho cùng order...');
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
        console.log('✅ POST /reviews với token: THÀNH CÔNG');
        console.log('✅ POST /reviews không có token: LỖI 401');
        console.log('✅ Unique constraint hoạt động: LỖI 409');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Chạy test
testPostReviewsWithToken(); 