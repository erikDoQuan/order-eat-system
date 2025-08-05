# Hệ thống Thanh toán (Payment System)

## ✅ Cải tiến đã thực hiện

### 1. UserTransactionService

- **Cập nhật method `create()`** để nhận transaction parameter
- **Hỗ trợ transaction rollback** khi có lỗi
- **Đảm bảo atomicity** cho các thao tác database

### 2. PaymentService

- **Xử lý logic thanh toán** theo method và status
- **Trường hợp 1**: Cash + Success → Tạo transaction ngay
- **Trường hợp 2**: ZaloPay → Không tạo transaction, chờ callback

### 3. ZaloPayController

- **Sử dụng PaymentService** để tạo transaction khi callback thành công
- **Transaction được bọc trong db.transaction()** để đảm bảo rollback

### 4. UserTransactionController

- **Xóa endpoint POST** để không cho phép tạo transaction trực tiếp
- **Chỉ cho phép GET** để xem danh sách transaction

## 🛠 Cách sử dụng

### Thanh toán tiền mặt (Cash)

```typescript
// POST /payment/process
{
  "userId": "user-uuid",
  "orderId": "order-uuid",
  "amount": "100000",
  "method": "cash",
  "status": "success",
  "transTime": "2024-01-01T00:00:00.000Z",
  "description": "Thanh toán tiền mặt"
}
```

### Thanh toán ZaloPay

```typescript
// POST /payment/process
{
  "userId": "user-uuid",
  "orderId": "order-uuid",
  "amount": "100000",
  "method": "zalopay",
  "status": "pending",
  "transTime": "2024-01-01T00:00:00.000Z",
  "description": "Thanh toán ZaloPay"
}
// Trả về: "ZaloPay transaction will be created upon successful callback."
```

### ZaloPay Callback

```typescript
// POST /zalopay/callback
// Tự động tạo transaction khi callback thành công
// Sử dụng PaymentService.createZaloPayTransaction()
```

## 🔒 Bảo mật

- **Không cho phép tạo transaction trực tiếp** qua UserTransactionController
- **Transaction chỉ được tạo** thông qua business logic
- **Rollback tự động** khi có lỗi trong transaction

## 📝 Lưu ý

- `user_transactions` được coi là **log cuối cùng**
- **Không tạo transaction tạm** cho ZaloPay
- **Chỉ tạo khi thanh toán thực sự thành công**
