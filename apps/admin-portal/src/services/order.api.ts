import axios from 'axios';

export async function createOrder(data: any) {
  const res = await axios.post('/api/v1/orders', data);
  return res.data;
}

export async function updateOrder(id: string, data: any) {
  const res = await axios.patch(`/api/v1/orders/${id}`, data);
  return res.data;
}

export async function deleteOrder(id: string) {
  const res = await axios.delete(`/api/v1/orders/${id}`);
  return res.data;
}

export async function getAllOrders() {
  const res = await axios.get('/api/v1/orders');
  return res.data?.data?.data || [];
}

export async function getOrdersByUserId(userId: string) {
  const res = await axios.get('/api/v1/orders', { params: { userId } });
  return res.data?.data?.data || [];
} 