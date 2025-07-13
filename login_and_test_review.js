// Script để đăng nhập và test review
const axios = require('axios');

async function loginAndTestReview() {
    try {
        console.log('=== Login và Test Review ===');

        // 1. Login
        console.log('\n1. Đăng nhập...');
        const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
            email: 'user@example.com', // Thay bằng email thật
            password: 'password123'    // Thay bằng password thật
        });

        const { accessToken, user } = loginResponse.data.data;
        console.log('✅ Login thành công');
        console.log('✅ User:', user.email);
        console.log('✅ Token:', accessToken.substring(0, 20) + '...');

        // 2. Lưu token vào localStorage (simulate browser)
        console.log('\n2. Lưu token vào localStorage...');
        // Trong Node.js không có localStorage, nhưng trong browser sẽ có

        // 3. Test GET /orders với token
        console.log('\n3. Test GET /orders...');
        const ordersResponse = await axios.get('http://localhost:3001/api/v1/orders', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
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

        // 4. Test POST /reviews
        console.log('\n4. Test POST /reviews...');
        const reviewData = {
            orderId: orderToReview.id,
            rating: 5,
            comment: 'Test review từ script sau khi login'
        };

        const reviewResponse = await axios.post('http://localhost:3001/api/v1/reviews', reviewData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Review tạo thành công:', reviewResponse.data.data.id);

        console.log('\n=== Hướng dẫn cho Browser ===');
        console.log('1. Mở Developer Tools (F12)');
        console.log('2. Vào tab Console');
        console.log('3. Chạy lệnh sau:');
        console.log(`localStorage.setItem('order-eat-access-token', '${accessToken}');`);
        console.log(`localStorage.setItem('order-eat-user', '${JSON.stringify(user)}');`);
        console.log('4. Refresh trang');
        console.log('5. Thử gửi review lại');

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

loginAndTestReview(); 