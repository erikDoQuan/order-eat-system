import axios from './axios';

export async function createOrder(data: any) {
  const res = await axios.post('/orders', data);
  return res.data.data || res.data;
}

export async function updateOrder(id: string, data: any) {
  const res = await axios.patch(`/orders/${id}`, data);
  return res.data;
}

export async function deleteOrder(id: string) {
  const res = await axios.delete(`/orders/${id}`);
  return res.data;
}

export async function getAllOrders() {
  const res = await axios.get('/orders');
  return res.data?.data?.data || [];
}

export async function getOrdersByUserId(userId: string, status?: string[]) {
  const params: any = { userId };
  if (status) params.status = status;
  const res = await axios.get('/orders', { params });
  return res.data?.data?.data || [];
}

export async function getOrderDetail(orderId: string) {
  const res = await axios.get(`/orders/${orderId}`);
  return res.data?.data || res.data;
}

export async function getOrderDetailByNumber(orderNumber: number | string) {
  const res = await axios.get(`/orders/by-number/${orderNumber}`);
  return res.data?.data || res.data;
}

export async function getOrderDetailByAppTransId(appTransId: string) {
  const res = await axios.get(`/orders/by-zalopay/${appTransId}`);
  return res.data?.data || res.data;
}

export async function getOrderByAppTransId(appTransId: string) {
  const res = await fetch(`/api/v1/orders/by-zalopay/${appTransId}`);
  if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
  return res.json();
}
