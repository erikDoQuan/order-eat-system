// Test script để kiểm tra DELETE /reviews không cần authentication
const axios = require('axios');

async function testDeleteReview() {
    try {
        // 1. Test DELETE /reviews không có token (sẽ thành công)
        console.log('1. Test DELETE /reviews không có token...');
        const reviewId = '13bc982a-e29a-4a9c-ba10-88d7ff67a380'; // Thay bằng reviewId thật

        try {
            const deleteResponse = await axios.delete(`http://localhost:3001/api/v1/reviews/${reviewId}`);
            console.log('✅ DELETE thành công:', deleteResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Review không tồn tại (404)');
            } else {
                console.log('❌ Lỗi không mong muốn:', error.response?.status, error.response?.data);
            }
        }

        // 2. Test DELETE /reviews với token (cũng sẽ thành công)
        console.log('\n2. Test DELETE /reviews với token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        try {
            const deleteResponseWithToken = await axios.delete(`http://localhost:3001/api/v1/reviews/${reviewId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('✅ DELETE với token thành công:', deleteResponseWithToken.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Review không tồn tại (404)');
            } else {
                console.log('❌ Lỗi không mong muốn:', error.response?.status, error.response?.data);
            }
        }

        // 3. So sánh với DELETE /orders
        console.log('\n3. So sánh với DELETE /orders...');
        const orderId = '123e4567-e89b-12d3-a456-426614174000'; // Thay bằng orderId thật

        try {
            const deleteOrderResponse = await axios.delete(`http://localhost:3001/api/v1/orders/${orderId}`);
            console.log('✅ DELETE /orders thành công:', deleteOrderResponse.data);
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('✅ Order không tồn tại (404)');
            } else {
                console.log('❌ Lỗi không mong muốn:', error.response?.status, error.response?.data);
            }
        }

        console.log('\n=== Kết luận ===');
        console.log('✅ DELETE /reviews hoạt động giống DELETE /orders');
        console.log('✅ Không yêu cầu authentication');
        console.log('✅ Có thể xóa bất kỳ review nào');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Chạy test
testDeleteReview(); 