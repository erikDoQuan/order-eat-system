# 🔧 SỬA LỖI TẠO ĐƠN HÀNG TRÙNG LẶP

## ❌ Vấn đề

Khi bấm "Tôi đã thanh toán", hệ thống tạo ra nhiều đơn hàng trùng lặp:

- 6541349c-572e-4fb9-b89e-2c18289f7e03 (order #160)
- f9ad1e09-be5e-4128-a13d-998ae8163259 (order #161)
- 701ec738-d32a-4b9d-a642-085086d05077 (order #162)

## ✅ Giải pháp

### 🎯 **Nguyên nhân:**

1. **User bấm nhiều lần** nút "Tôi đã thanh toán" trước khi chuyển trang
2. **Nút không bị disable** ngay lập tức khi bắt đầu xử lý
3. **Không có kiểm tra** đơn hàng pending gần đây ở backend

### 🔧 **Thay đổi Frontend:**

#### 1. Thêm state `isProcessing`

```typescript
const [isProcessing, setIsProcessing] = useState(false);
```

#### 2. Disable nút ngay khi bắt đầu xử lý

```typescript
const handleConfirmPayment = async () => {
  // Ngăn chặn bấm nhiều lần
  if (isProcessing) return;

  setIsProcessing(true);
  setLoading(true);
  // ... xử lý logic
};
```

#### 3. Cập nhật UI nút

```typescript
<button
  onClick={handleConfirmPayment}
  disabled={loading || isProcessing}
  // ...
>
  {loading ? 'Đang tạo đơn hàng...' : isProcessing ? 'Đang xử lý...' : 'Tôi đã thanh toán'}
</button>
```

#### 4. Chuyển trang ngay lập tức

```typescript
if (data.return_code === 1) {
  // Reset giỏ hàng
  clearCart();

  // Chuyển trang ngay lập tức
  navigate('/order-success', { state: { ... } });

  // Không reset isProcessing vì đã chuyển trang
  return;
}
```

### 🔧 **Thay đổi Backend:**

#### 1. Tạo method riêng `createOrderWithoutTransaction`

```typescript
private async createOrderWithoutTransaction(dto: CreateOrderDto) {
  // Không tạo user_transaction trong method này
  // Chỉ tạo đơn hàng
}
```

#### 2. Kiểm tra đơn hàng pending gần đây

```typescript
// Kiểm tra đơn hàng pending gần đây (trong 5 phút) để tránh tạo trùng
if (dto.userId) {
  const recentOrders = await this.orderRepository.find({
    userId: dto.userId,
    status: ['pending'],
    limit: 5,
    offset: 0,
  });

  const FIVE_MINUTES = 5 * 60 * 1000;
  const now = Date.now();
  const recentPendingOrder = recentOrders.data?.find(order => {
    const orderTime = new Date(order.createdAt).getTime();
    return now - orderTime < FIVE_MINUTES;
  });

  if (recentPendingOrder) {
    return recentPendingOrder; // Trả về đơn hàng đã tồn tại
  }
}
```

#### 3. Tạo user_transaction sau khi có thông tin ZaloPay

```typescript
// Tạo user_transaction sau khi đã có thông tin ZaloPay
if (order.userId) {
  await this.userTransactionService.create({
    userId: order.userId,
    orderId: order.id,
    amount: String(order.totalAmount),
    method: TransactionMethod.ZALOPAY,
    status: TransactionStatus.PENDING,
    transTime: new Date().toISOString(),
    transactionCode: zalopayResult.zp_trans_token || '',
    description: `Tạo giao dịch ZaloPay cho đơn hàng #${order.orderNumber}`,
  });
}
```

## 🎯 **Kết quả:**

### ✅ **Frontend:**

- Nút bị disable ngay khi bắt đầu xử lý
- Chuyển trang ngay lập tức sau khi tạo đơn hàng thành công
- Reset giỏ hàng trước khi chuyển trang
- Ngăn chặn user bấm nhiều lần

### ✅ **Backend:**

- Chỉ tạo 1 đơn hàng duy nhất
- Kiểm tra đơn hàng pending gần đây (5 phút)
- Tạo user_transaction với thông tin ZaloPay đầy đủ
- Tránh tạo đơn hàng trùng lặp

### 📊 **Quy trình mới:**

1. User bấm "Tôi đã thanh toán" → Nút disable ngay lập tức
2. Backend kiểm tra đơn hàng pending gần đây
3. Tạo đơn hàng (nếu chưa có) + ZaloPay + user_transaction
4. Frontend chuyển đến OrderSuccessPage ngay lập tức
5. Reset giỏ hàng

## 🧪 **Testing:**

- Test bấm nút nhiều lần → Chỉ tạo 1 đơn hàng
- Test chuyển trang → OrderSuccessPage hiển thị đúng
- Test reset giỏ hàng → Giỏ hàng trống
- Test callback ZaloPay → Cập nhật trạng thái thành công
