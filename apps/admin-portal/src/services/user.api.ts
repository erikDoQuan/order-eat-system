import axios from 'axios';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  password?: string;
};

export const getAllUsers = async (): Promise<User[]> => {
  const res = await axios.get('/api/v1/admin/users');
  return res.data.data;
};

export const deleteUser = async (id: string) => {
  // implementation
};

export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phoneNumber: string,
  address: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
        role: 'user',
        isActive: true,
      }),
    });
    const data = await res.json().catch(() => null);
    if (res.ok) {
      return { success: true, message: 'Đăng ký thành công' };
    }
    return { success: false, message: data?.message || 'Đăng ký thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}

export async function deleteOrder(id: string) {
  if (!id || typeof id !== 'string') throw new Error('Order id is required and must be a string');
  return axios.delete(`/api/v1/orders/${id}`);
}

export const createUser = async (data: Partial<User> & { password: string }) => {
  const res = await axios.post('/api/v1/admin/users', data);
  return res.data;
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await axios.patch(`/api/v1/admin/users/${id}`, data);
  return res.data;
};

// Lấy tất cả order_items của user
export async function getOrderItemsByUserId(userId: string) {
  const url = `/api/v1/orders?userId=${userId}`;
  console.log('[DEBUG] Gọi API:', url);
  const res = await fetch(url);
  console.log('[DEBUG] Status:', res.status);
  let data;
  try {
    data = await res.json();
    console.log('[DEBUG] Response data:', data);
  } catch (e) {
    console.error('[DEBUG] Lỗi parse JSON:', e);
    throw new Error('Không lấy được order_items');
  }
  if (!res.ok) {
    throw new Error(data?.message || 'Không lấy được order_items');
  }
  const orders = data.data?.data || [];
  let allItems: any[] = [];
  for (const order of orders) {
    if (order?.isActive === false) continue;
    let orderItems = order?.orderItems;
    if (typeof orderItems === 'string') {
      try {
        orderItems = JSON.parse(orderItems);
      } catch (e) {
        console.error('[DEBUG] Lỗi parse orderItems:', e, orderItems);
      }
    }
    if (orderItems?.items) {
      allItems = allItems.concat(orderItems.items.map(item => ({ ...item, orderId: order.id })));
    }
  }
  console.log('[DEBUG] allItems:', allItems);
  return allItems;
}

export const updateOrderItemQuantity = (
  orderItemId: string,
  quantity: number,
) =>
  axios
    .patch(`/api/v1/order-items/${orderItemId}`, { quantity })
    .then(res => res.data);