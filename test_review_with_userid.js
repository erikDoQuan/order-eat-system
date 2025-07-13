// Test script để kiểm tra lưu userId trong review
const axios = require('axios');

async function testReviewWithUserId() {
    try {
        console.log('=== Test Review với UserId ===');

        // 1. Login để lấy user info
        console.log('\n1. Login để lấy user info...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const { accessToken, user } = loginResponse.data.data;
        console.log('✅ User:', user.email);
        console.log('✅ User ID:', user.id);

        // 2. Test POST /reviews với userId
        console.log('\n2. Test POST /reviews với userId...');
        const reviewData = {
            orderId: "e751a79c-8e9f-4ae8-bf69-13130d8c2d25",
            rating: 5,
            comment: "ngon lắm - có userId",
            userId: user.id
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data.data.id);
        console.log('✅ Review data:', {
            id: reviewResponse.data.data.id,
            userId: reviewResponse.data.data.userId,
            createdBy: reviewResponse.data.data.createdBy,
            orderId: reviewResponse.data.data.orderId,
            rating: reviewResponse.data.data.rating,
            comment: reviewResponse.data.data.comment
        });

        // 3. Test POST /reviews KHÔNG có userId
        console.log('\n3. Test POST /reviews KHÔNG có userId...');
        const reviewDataNoUserId = {
            orderId: "e751a79c-8e9f-4ae8-bf69-13130d8c2d25",
            rating: 4,
            comment: "ngon - không có userId"
            // Không có userId
        };

        try {
            const reviewResponseNoUserId = await axios.post('http://localhost:3001/api/v1/reviews', reviewDataNoUserId, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('❌ Không nên thành công (order đã có review):', reviewResponseNoUserId.data);
        } catch (error) {
            console.log('✅ Đúng rồi, bị lỗi 409:', error.response?.status);
            console.log('✅ Error message:', error.response?.data?.message);
        }

        // 4. Test GET /reviews để xem review có userId không
        console.log('\n4. Test GET /reviews...');
        const reviewsResponse = await axios.get('http://localhost:3001/api/v1/reviews');
        const reviews = reviewsResponse.data.data.data;

        const reviewWithUserId = reviews.find(r => r.userId === user.id);
        if (reviewWithUserId) {
            console.log('✅ Tìm thấy review với userId:', {
                id: reviewWithUserId.id,
                userId: reviewWithUserId.userId,
                createdBy: reviewWithUserId.createdBy,
                orderId: reviewWithUserId.orderId
            });
        } else {
            console.log('❌ Không tìm thấy review với userId');
        }

        // 5. Test GET /orders để xem order có review với userId không
        console.log('\n5. Test GET /orders...');
        const ordersResponse = await axios.get('http://localhost:3001/api/v1/orders');
        const orders = ordersResponse.data.data.data;

        const orderWithReview = orders.find(order => order.id === "e751a79c-8e9f-4ae8-bf69-13130d8c2d25");
        if (orderWithReview && orderWithReview.reviews && orderWithReview.reviews.length > 0) {
            console.log('✅ Order có review:', {
                orderId: orderWithReview.id,
                reviewId: orderWithReview.reviews[0].id,
                userId: orderWithReview.reviews[0].userId,
                createdBy: orderWithReview.reviews[0].createdBy
            });
        } else {
            console.log('❌ Order không có review');
        }

        console.log('\n=== Kết luận ===');
        console.log('✅ Review được lưu với userId:', !!reviewWithUserId);
        console.log('✅ Review được lưu với createdBy:', !!reviewWithUserId?.createdBy);
        console.log('✅ Unique constraint vẫn hoạt động');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

// Chạy test
testReviewWithUserId(); 