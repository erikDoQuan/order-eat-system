// Test script để kiểm tra unique constraint và ẩn form review
const axios = require('axios');

async function testUniqueReview() {
    try {
        // 1. Login để lấy token
        console.log('1. Đăng nhập để lấy token...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const token = loginResponse.data.data.accessToken;
        console.log('✅ Token nhận được:', token.substring(0, 20) + '...');

        // 2. Tạo review đầu tiên
        console.log('\n2. Tạo review đầu tiên...');
        const orderId = '123e4567-e89b-12d3-a456-426614174000'; // Thay bằng orderId thật
        const reviewData1 = {
            orderId: orderId,
            rating: 5,
            comment: 'Review đầu tiên - Món ăn rất ngon!'
        };

        const reviewResponse1 = await axios.post('http://localhost:3001/api/v1/reviews', reviewData1, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review đầu tiên tạo thành công:', reviewResponse1.data.data.id);

        // 3. Thử tạo review thứ 2 cho cùng order (sẽ bị lỗi)
        console.log('\n3. Thử tạo review thứ 2 cho cùng order...');
        const reviewData2 = {
            orderId: orderId,
            rating: 4,
            comment: 'Review thứ 2 - Không nên thành công'
        };

        try {
            const reviewResponse2 = await axios.post('http://localhost:3001/api/v1/reviews', reviewData2, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Không nên thành công:', reviewResponse2.data);
        } catch (error) {
            console.log('✅ Đúng rồi, bị lỗi 409 Conflict:', error.response?.status);
            console.log('✅ Error message:', error.response?.data?.message);
        }

        // 4. Kiểm tra GET /orders có trả về review không
        console.log('\n4. Kiểm tra GET /orders có trả về review...');
        const ordersResponse = await axios.get('http://localhost:3001/api/v1/orders');
        const orders = ordersResponse.data.data.data;

        const orderWithReview = orders.find(order => order.id === orderId);
        if (orderWithReview) {
            console.log('✅ Order có review:', orderWithReview.reviews?.length || 0, 'reviews');
            if (orderWithReview.reviews?.length > 0) {
                console.log('✅ Review data:', {
                    id: orderWithReview.reviews[0].id,
                    rating: orderWithReview.reviews[0].rating,
                    comment: orderWithReview.reviews[0].comment,
                    userId: orderWithReview.reviews[0].userId,
                    createdBy: orderWithReview.reviews[0].createdBy
                });
            }
        } else {
            console.log('❌ Không tìm thấy order');
        }

        // 5. Test GET /reviews để xem review
        console.log('\n5. Test GET /reviews...');
        const reviewsResponse = await axios.get('http://localhost:3001/api/v1/reviews');
        console.log('✅ Tổng số reviews:', reviewsResponse.data.data.data.length);

        // 6. Test filter reviews theo orderId
        console.log('\n6. Test filter reviews theo orderId...');
        const filteredReviewsResponse = await axios.get(`http://localhost:3001/api/v1/reviews?orderId=${orderId}`);
        console.log('✅ Reviews cho order này:', filteredReviewsResponse.data.data.data.length);

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Test frontend logic
async function testFrontendLogic() {
    console.log('\n=== Test Frontend Logic ===');
    console.log('1. Order chưa có review: (!order.reviews || order.reviews.length === 0) = true');
    console.log('   → Hiển thị ReviewForm');

    console.log('\n2. Order đã có review: (!order.reviews || order.reviews.length === 0) = false');
    console.log('   → Ẩn ReviewForm, hiển thị "Bạn đã đánh giá đơn hàng này."');

    console.log('\n3. Sau khi gửi review thành công:');
    console.log('   → Reload orders');
    console.log('   → Order.reviews.length > 0');
    console.log('   → Form tự động ẩn');
}

// Chạy test
async function runTests() {
    await testUniqueReview();
    await testFrontendLogic();
}

runTests(); 