# 📋 TÓM TẮT THAY ĐỔI - SỬA QUY TRÌNH THANH TOÁN ZALOPAY

## 🎯 Mục tiêu

Sửa quy trình thanh toán ZaloPay để không tạo đơn hàng quá sớm, chỉ tạo khi người dùng thực sự xác nhận thanh toán.

## 🔧 Thay đổi Backend

### 1. OrderController (`apps/api/src/modules/order/order.controller.ts`)

- ✅ Thêm endpoint `POST /api/v1/orders/confirm-order`
- ✅ Endpoint này nhận thông tin đơn hàng và tạo đơn ZaloPay

### 2. OrderService (`apps/api/src/modules/order/order.service.ts`)

- ✅ Thay đổi method `confirmOrder()` để:
  - Tạo đơn hàng trong database với status `pending`
  - Tạo đơn hàng ZaloPay
  - Cập nhật thông tin `appTransId` và `zpTransToken`
  - Trả về thông tin ZaloPay (order_url, qrcode, etc.)

### 3. Database Schema (`apps/api/src/database/schema/orders.ts`)

- ✅ Thêm trường `zpTransToken: varchar(255)`

### 4. Migration (`apps/api/src/database/migrations/0027_add_zp_trans_token_to_orders.sql`)

- ✅ Tạo migration để thêm trường `zp_trans_token` vào bảng orders

### 5. DTO (`apps/api/src/modules/order/dto/create-order.dto.ts`)

- ✅ Thêm trường `zpTransToken?: string` vào CreateOrderDto

## 🎨 Thay đổi Frontend

### 1. ZaloPayPaymentPage (`apps/admin-portal/src/pages/ZaloPayPaymentPage.tsx`)

- ✅ **Bỏ** useEffect tạo đơn hàng ZaloPay ngay khi vào trang
- ✅ Thêm state `paymentConfirmed` để theo dõi trạng thái
- ✅ Thêm hàm `handleConfirmPayment()` để xử lý khi người dùng bấm "Tôi đã thanh toán"
- ✅ Cập nhật UI để chỉ hiển thị QR code khi đã tạo đơn hàng
- ✅ Cập nhật nút "Tôi đã thanh toán" với text động
- ✅ Cập nhật countdown và kiểm tra trạng thái chỉ khi đã tạo đơn hàng

## 🔄 Quy trình mới

### Trước (❌ Sai):

1. User vào trang → Tạo đơn ZaloPay ngay lập tức
2. User có thể thoát → Đơn hàng "treo" trong database
3. Rủi ro cao nếu user đổi phương thức thanh toán

### Sau (✅ Đúng):

1. User vào trang → Chỉ hiển thị thông tin, không tạo đơn hàng
2. User bấm "Tôi đã thanh toán" → Tạo đơn hàng + ZaloPay
3. Redirect đến ZaloPay để thanh toán
4. ZaloPay callback → Cập nhật trạng thái thành công

## 🧪 Testing cần thiết

### 1. Test tạo đơn hàng

```bash
curl -X POST http://localhost:3000/api/v1/orders/confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id",
    "orderItems": {"items": [{"dishId": "dish_id", "quantity": 1}]},
    "totalAmount": 100000,
    "type": "pickup",
    "paymentMethod": "zalopay"
  }'
```

### 2. Test callback

```bash
curl -X POST http://localhost:3000/api/v1/zalopay/callback \
  -H "Content-Type: application/json" \
  -d '{
    "return_code": 1,
    "app_trans_id": "test_trans_id",
    "zp_trans_token": "test_token"
  }'
```

## ⚠️ Lưu ý quan trọng

1. **Migration**: Cần chạy migration để thêm trường `zp_trans_token`
2. **Environment variables**: Đảm bảo `ZP_CALLBACK_URL` được cấu hình đúng
3. **Testing**: Test toàn bộ flow từ frontend đến backend
4. **Monitoring**: Theo dõi logs để đảm bảo callback hoạt động

## 🚀 Deployment

1. Deploy migration trước
2. Deploy backend với code mới
3. Deploy frontend với code mới
4. Test flow thanh toán end-to-end
5. Monitor logs và database

## 📊 Kết quả mong đợi

- ✅ Không còn đơn hàng "treo" trong database
- ✅ User experience tốt hơn
- ✅ Giảm rủi ro khi user thoát giữa chừng
- ✅ Quy trình thanh toán rõ ràng và an toàn hơn
