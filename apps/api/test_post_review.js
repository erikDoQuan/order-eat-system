const axios = require('axios');

// Thay accessToken này bằng token thực tế lấy từ localStorage sau khi đăng nhập
const accessToken = 'PASTE_YOUR_ACCESS_TOKEN_HERE';

async function testPostReview() {
    try {
        const res = await axios.post(
            'http://localhost:3000/api/v1/reviews',
            {
                orderId: '01f71263-fd9c-47fd-a8bb-14b8661b1efd',
                rating: 4,
                comment: 'rất ngon',
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );
        console.log('✅ Gửi đánh giá thành công:', res.data);
    } catch (err) {
        console.error('❌ Lỗi gửi đánh giá:', err.response?.data || err.message);
    }
}

testPostReview(); 