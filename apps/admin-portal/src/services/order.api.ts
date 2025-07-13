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