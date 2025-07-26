const axios = require('axios');

async function testZaloPayCallback() {
    try {
        console.log('🧪 Testing ZaloPay callback endpoint...');

        const testData = {
            app_trans_id: 'test_123456',
            return_code: 1,
            amount: 100000,
            embed_data: JSON.stringify({
                redirecturl: 'https://fda84102a052.ngrok-free.app/order-success',
                callbackurl: 'https://fda84102a052.ngrok-free.app/api/v1/zalopay/callback',
                userId: 'test_user_123',
                items: [],
                orderId: 'test_order_123',
                totalAmount: 100000,
                note: 'Test order',
                deliveryAddress: 'Test address'
            }),
            zp_trans_token: 'test_token_123'
        };

        const response = await axios.post('http://localhost:3000/api/v1/zalopay/callback', testData, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ZaloPay-Server/1.0'
            }
        });

        console.log('✅ Callback test successful!');
        console.log('📧 Response:', response.data);

    } catch (error) {
        console.error('❌ Callback test failed:', error.response?.data || error.message);
    }
}

testZaloPayCallback(); 