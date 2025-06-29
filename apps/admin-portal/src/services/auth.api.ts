export async function login(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  message: string;
  accessToken?: string;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    phone_number?: string;
    role: 'user' | 'admin';
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
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          phoneNumber: data.user.phoneNumber,
          phone_number: data.user.phone_number || data.user.phoneNumber,
          role: data.user.role,
        },
      };
    }

    return { success: false, message: data?.message || 'Đăng nhập thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}
