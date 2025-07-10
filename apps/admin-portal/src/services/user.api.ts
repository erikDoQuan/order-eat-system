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
  avatar?: string;
  lastLogin?: string;
  createdBy?: string;
  updatedBy?: string;
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
    console.log('Sending registration request:', { email, firstName, lastName, phoneNumber, address });
    
    const res = await fetch('http://localhost:3001/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
      }),
    });
    
    console.log('Registration response status:', res.status);
    
    const data = await res.json().catch(() => null);
    console.log('Registration response data:', data);
    
    if (res.ok) {
      return { success: true, message: data?.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.' };
    }
    return { success: false, message: data?.message || 'Đăng ký thất bại' };
  } catch (err) {
    console.error('Registration error:', err);
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