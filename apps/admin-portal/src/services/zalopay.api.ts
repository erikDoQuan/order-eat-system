// apps/admin-portal/src/services/zalopay.api.ts

export async function checkZaloPayOrderStatus(appTransId: string) {
  const res = await fetch(`/zalopay/check-status?appTransId=${encodeURIComponent(appTransId)}`);
  if (!res.ok) throw new Error('Không thể kiểm tra trạng thái đơn hàng ZaloPay');
  return res.json();
}
