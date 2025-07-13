// Chạy script này trong browser console (F12)
console.log('=== Debug Token trong Browser ===');

// Kiểm tra token
const token = localStorage.getItem('order-eat-access-token');
console.log('Token exists:', !!token);
if (token) {
    console.log('Token:', token.substring(0, 50) + '...');

    // Decode JWT token để xem thông tin
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expires at:', new Date(payload.exp * 1000));
        console.log('Token is expired:', Date.now() > payload.exp * 1000);
    } catch (e) {
        console.log('Cannot decode token:', e);
    }
} else {
    console.log('❌ No token found');
}

// Kiểm tra user
const user = localStorage.getItem('order-eat-user');
if (user) {
    console.log('User:', JSON.parse(user));
} else {
    console.log('❌ No user found');
}

// Kiểm tra tất cả localStorage
console.log('\nAll localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value?.substring(0, 100)}...`);
} 