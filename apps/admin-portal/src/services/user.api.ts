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

export const createUser = async (data: Partial<User> & { password: string }) => {
  const res = await axios.post('/api/v1/admin/users', data);
  return res.data;
};

export const updateUser = async (id: string, data: Partial<User>) => {
  const res = await axios.patch(`/api/v1/admin/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`/api/v1/admin/users/${id}`);
  return res.data;
};