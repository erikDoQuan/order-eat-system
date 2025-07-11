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

export const getAllUsers = async (page = 1, limit = 10, search = ''): Promise<{ users: User[]; totalItems: number; currentPage: number; totalPages: number }> => {
  const params: any = { page, limit };
  if (search) params.search = search;
  const res = await axios.get('/api/v1/admin/users', { params });
  const meta = res.data.meta?.paging || {};
  // Map is_active -> isActive nếu có
  const users = (res.data.data || []).map((u: any) => ({ ...u, isActive: u.isActive !== undefined ? u.isActive : u.is_active }));
  return {
    users,
    totalItems: meta.totalItems || res.data.totalItems || res.data.pagination?.totalItems || 0,
    currentPage: meta.currentPage || page,
    totalPages: meta.totalPages || Math.ceil((meta.totalItems || 0) / (meta.itemsPerPage || limit))
  };
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
    // Normalize email trước khi gửi lên backend
    const normalizedEmail = email.trim().toLowerCase();
    const res = await fetch('http://localhost:3001/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizedEmail,
        password,
        firstName,
        lastName,
        phoneNumber,
        address,
      }),
    });
    
    
    const data = await res.json().catch(() => null);
    
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
  const res = await fetch(url);
  let data;
  try {
    data = await res.json();
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
  return allItems;
}

export const updateOrderItemQuantity = (
  orderItemId: string,
  quantity: number,
) =>
  axios
    .patch(`/api/v1/order-items/${orderItemId}`, { quantity })
    .then(res => res.data);