-- Tạo enum type
CREATE TYPE cancellation_reason AS ENUM (
  'Khách hàng yêu cầu hủy đơn',
  'Không thể liên hệ khách hàng',
  'Hết món ăn',
  'Địa chỉ giao hàng không hợp lệ',
  'Đơn nghi ngờ gian lận',
  'Khu vực ngoài phạm vi giao hàng'
);

-- Thay đổi cột cancellation_reason từ TEXT sang ENUM
ALTER TABLE orders ALTER COLUMN cancellation_reason TYPE cancellation_reason USING cancellation_reason::cancellation_reason; 