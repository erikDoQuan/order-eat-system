// Hàm chuyển đổi status sang text hiển thị, dùng chung cho các trang
export function getOrderStatusText(status: string, t?: (key: string) => string): string {
  if (status === 'cancelled') return t ? t('order_cancelled') : 'Đã huỷ';
  if (status === 'completed') return t ? t('order_completed') : 'Đã hoàn thành';
  if (status === 'confirmed') return t ? t('order_confirmed') : 'Đã xác nhận';
  if (status === 'pending') return t ? t('order_pending') : 'Chờ xác nhận';
  if (status === 'delivering') return 'Đang giao hàng';
  return status;
} 