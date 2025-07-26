const axios = require('axios');

async function checkZaloPayConfig() {
    console.log('🔍 Kiểm tra cấu hình ZaloPay...');

    try {
        // Test backend endpoint
        const response = await axios.get('http://localhost:3000/api/v1/zalopay/test-callback');
        console.log('✅ Backend đang chạy:', response.data);
    } catch (error) {
        console.error('❌ Backend không chạy:', error.message);
        return;
    }

    // Kiểm tra ngrok
    try {
        const ngrokResponse = await axios.get('https://fda84102a052.ngrok-free.app/api/v1/zalopay/test-callback');
        console.log('✅ Ngrok đang hoạt động:', ngrokResponse.data);
    } catch (error) {
        console.error('❌ Ngrok không hoạt động:', error.message);
        return;
    }

    console.log('\n📋 Cấu hình cần kiểm tra:');
    console.log('1. ZaloPay Developer Portal:');
    console.log('   - Callback URL: https://fda84102a052.ngrok-free.app/api/v1/zalopay/callback');
    console.log('   - Redirect URL: https://fda84102a052.ngrok-free.app/order-success');
    console.log('2. Environment variables:');
    console.log('   - ZP_APP_ID: [kiểm tra trong .env]');
    console.log('   - ZP_KEY1: [kiểm tra trong .env]');
    console.log('   - ZP_CREATE_ORDER: [kiểm tra trong .env]');
    console.log('3. Ngrok:');
    console.log('   - Đang forward: https://fda84102a052.ngrok-free.app -> http://localhost:3000');

    console.log('\n🎯 Để test callback:');
    console.log('1. Tạo đơn hàng qua frontend');
    console.log('2. Thanh toán qua Bank Simulator');
    console.log('3. Kiểm tra ngrok logs: http://127.0.0.1:4040');
    console.log('4. Kiểm tra backend logs');
}

checkZaloPayConfig(); 