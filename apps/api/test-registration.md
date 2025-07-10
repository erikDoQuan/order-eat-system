# Hướng dẫn Test Đăng ký và Email Verification

## 1. Kiểm tra cấu hình Email

Đảm bảo các biến môi trường sau được cấu hình trong file `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
```

## 2. Test cấu hình Email

Gọi API test email:
```bash
curl -X POST http://localhost:3001/api/v1/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 3. Test đăng ký hoàn chỉnh

### Bước 1: Đăng ký user mới
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "0123456789",
    "address": "123 Test Street, Nha Trang"
  }'
```

### Bước 2: Kiểm tra email trong database
```bash
curl -X GET http://localhost:3001/api/v1/auth/debug/emails
```

### Bước 3: Xác thực email
Mở email và click vào link xác thực, hoặc gọi API:
```bash
curl -X GET "http://localhost:3001/api/v1/auth/verify-email?token=YOUR_TOKEN"
```

### Bước 4: Đăng nhập
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

## 4. Validation Password

Password phải đáp ứng:
- Ít nhất 6 ký tự (validation cơ bản như admin endpoint)

## 5. Troubleshooting

### Lỗi "Email đã tồn tại"
1. Kiểm tra database có email cũ không
2. Xóa user cũ nếu cần
3. Kiểm tra log để xem email được normalize như thế nào

### Lỗi gửi email
1. Kiểm tra cấu hình SMTP
2. Kiểm tra App Password cho Gmail
3. Kiểm tra firewall/network

### Lỗi validation
1. Đảm bảo password đúng format
2. Đảm bảo email hợp lệ
3. Đảm bảo phone number đúng format Việt Nam 