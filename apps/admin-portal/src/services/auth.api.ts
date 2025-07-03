export async function login(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  accessToken?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    phone_number?: string;
    address?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    avatar?: string;
  };
}> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.accessToken && data?.user) {
      // Lưu accessToken vào localStorage để sử dụng cho các request cần token
      localStorage.setItem('order-eat-access-token', data.accessToken);
      return {
        success: true,
        message: 'Đăng nhập thành công',
        accessToken: data.accessToken,
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phoneNumber: data.user.phoneNumber,
          phone_number: data.user.phone_number || data.user.phoneNumber,
          address: data.user.address,
          role: data.user.role,
          isActive: data.user.isActive,
          lastLogin: data.user.lastLogin,
          createdAt: data.user.createdAt,
          updatedAt: data.user.updatedAt,
          createdBy: data.user.createdBy,
          updatedBy: data.user.updatedBy,
          avatar: data.user.avatar,
        },
      };
    }

    return { success: false, message: data?.message || 'Đăng nhập thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}
