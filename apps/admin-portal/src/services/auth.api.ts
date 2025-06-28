export async function login(
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  user?: { email: string; firstName?: string; lastName?: string; role: 'user' | 'admin' };
}> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);

    if (res.status === 200 && data?.accessToken && data?.user) {
      return {
        success: true,
        message: 'Đăng nhập thành công',
        user: {
          email: data.user.email,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role,
        },
      };
    }

    return { success: false, message: data?.message || 'Đăng nhập thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}
