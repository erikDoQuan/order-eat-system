// Script debug để kiểm tra token trong localStorage
console.log('=== Debug Token ===');

// Kiểm tra các key có thể chứa token
const possibleKeys = [
    'accessToken',
    'order-eat-access-token',
    'token',
    'authToken'
];

console.log('Các key trong localStorage:');
possibleKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
        console.log(`✅ ${key}: ${value.substring(0, 20)}...`);
    } else {
        console.log(`❌ ${key}: null`);
    }
});

// Kiểm tra user trong localStorage
const userKey = 'order-eat-user';
const userValue = localStorage.getItem(userKey);
if (userValue) {
    const user = JSON.parse(userValue);
    console.log('✅ User:', user);
} else {
    console.log('❌ User: null');
}

// Test axios interceptor
console.log('\n=== Test Axios Interceptor ===');
const token = localStorage.getItem('order-eat-access-token');
if (token) {
    console.log('✅ Token found:', token.substring(0, 20) + '...');

    // Test POST /reviews
    const shouldSendAuth = !(
        (false && // method === 'get'
            false && // url === '/reviews'
            false) || // url.startsWith('/reviews?')
        (false && // method === 'delete'
            false) // url.startsWith('/reviews/')
    );

    console.log('Should send Authorization for POST /reviews:', shouldSendAuth);
} else {
    console.log('❌ No token found');
}

// Kiểm tra tất cả localStorage keys
console.log('\n=== All localStorage keys ===');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
} 