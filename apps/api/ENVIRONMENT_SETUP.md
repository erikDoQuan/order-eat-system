# Environment Variables Setup

## ZaloPay Configuration

Để ZaloPay hoạt động đúng, cần thêm các environment variables sau:

### API Configuration

```env
# API Base URL (thay đổi theo môi trường)
API_BASE_URL=http://localhost:3000
# hoặc cho production
API_BASE_URL=https://your-domain.com

# Frontend URL (thay đổi theo môi trường)
FRONTEND_URL=http://localhost:3001
# hoặc cho production
FRONTEND_URL=https://your-frontend-domain.com
```

### ZaloPay Configuration

```env
# ZaloPay App Configuration
ZP_APP_ID=your_zalopay_app_id
ZP_KEY1=your_zalopay_key1
ZP_KEY2=your_zalopay_key2
ZP_CREATE_ORDER=https://sandbox.zalopay.com.vn/v001/tpe/createorder
ZP_CHECK_STATUS=https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid

# ZaloPay Callback URLs (sẽ được tạo tự động từ API_BASE_URL)
ZP_CALLBACK_URL=${API_BASE_URL}/api/v1/zalopay/callback
ZP_REDIRECT_URL=${API_BASE_URL}/api/v1/zalopay/redirect-after-zalopay
```

## Flow hoạt động:

1. **User thanh toán** → ZaloPay
2. **ZaloPay callback** → `${API_BASE_URL}/api/v1/zalopay/callback`
3. **ZaloPay redirect** → `${API_BASE_URL}/api/v1/zalopay/redirect-after-zalopay`
4. **API redirect** → `${FRONTEND_URL}/order-success`

## Lưu ý:

- Đảm bảo `API_BASE_URL` và `FRONTEND_URL` đúng với môi trường của bạn
- Nếu sử dụng ngrok, thay đổi URL tương ứng
- ZaloPay chỉ chấp nhận HTTPS URLs cho production
