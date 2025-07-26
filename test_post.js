const https = require('https');

const data = JSON.stringify({
    app_trans_id: 'test123',
    return_code: 1,
    amount: 100000
});

const options = {
    hostname: 'fda84102a052.ngrok-free.app',
    port: 443,
    path: '/api/v1/zalopay/callback',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);

    res.on('data', (chunk) => {
        console.log('Response:', chunk.toString());
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.write(data);
req.end();

console.log('POST request sent to ngrok!'); 