// Test ZaloPay Configuration
console.log('=== ZALOPAY CONFIGURATION TEST ===');

// Check environment variables
const config = {
    ZP_APP_ID: process.env.ZP_APP_ID || '2554',
    ZP_KEY1: process.env.ZP_KEY1 || '',
    ZP_KEY2: process.env.ZP_KEY2 || '',
    ZP_CREATE_ORDER: process.env.ZP_CREATE_ORDER || 'https://sb-openapi.zalopay.vn/v2/create',
    ZP_CALLBACK_URL: process.env.ZP_CALLBACK_URL || '',
    ZP_REDIRECT_URL: process.env.ZP_REDIRECT_URL || '',
};

console.log('ZP_APP_ID:', config.ZP_APP_ID);
console.log('ZP_KEY1:', config.ZP_KEY1 ? '***SET***' : 'NOT SET');
console.log('ZP_KEY2:', config.ZP_KEY2 ? '***SET***' : 'NOT SET');
console.log('ZP_CREATE_ORDER:', config.ZP_CREATE_ORDER);
console.log('ZP_CALLBACK_URL:', config.ZP_CALLBACK_URL);
console.log('ZP_REDIRECT_URL:', config.ZP_REDIRECT_URL);

// Test URL format
const testOrderUrl = 'https://qcgateway.zalopay.vn/openinapp?order=eyJ6cHRyYW5zdG9rZW4iOiJBQ3cwMW9tb1JqTmVieDdPRGdPcW5IbnciLCJhcHBpZCI6MjU1NH0=';

console.log('\n=== TEST ORDER URL ===');
console.log('Test URL:', testOrderUrl);

// Parse the order parameter
try {
    const url = new URL(testOrderUrl);
    const orderParam = url.searchParams.get('order');
    console.log('Order parameter:', orderParam);

    if (orderParam) {
        const decoded = Buffer.from(orderParam, 'base64').toString('utf-8');
        console.log('Decoded order:', decoded);

        try {
            const orderData = JSON.parse(decoded);
            console.log('Parsed order data:', orderData);
        } catch (e) {
            console.log('Failed to parse order data as JSON');
        }
    }
} catch (e) {
    console.log('Failed to parse URL:', e.message);
}

console.log('\n=== RECOMMENDATIONS ===');
if (!config.ZP_KEY1) {
    console.log('❌ ZP_KEY1 is not set - ZaloPay will not work');
}
if (!config.ZP_KEY2) {
    console.log('❌ ZP_KEY2 is not set - ZaloPay will not work');
}
if (!config.ZP_CALLBACK_URL) {
    console.log('⚠️ ZP_CALLBACK_URL is not set - Callbacks may not work');
}
if (!config.ZP_REDIRECT_URL) {
    console.log('⚠️ ZP_REDIRECT_URL is not set - Redirects may not work');
}

console.log('\n=== SAMPLE ENV FILE ===');
console.log(`
# ZaloPay Configuration
ZP_APP_ID=2554
ZP_KEY1=your_key1_here
ZP_KEY2=your_key2_here
ZP_CREATE_ORDER=https://sb-openapi.zalopay.vn/v2/create
ZP_CALLBACK_URL=https://yourdomain.com/api/v1/zalopay/callback
ZP_REDIRECT_URL=https://yourdomain.com/order-success
`); 