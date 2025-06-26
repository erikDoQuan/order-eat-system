export async function login(email: string, password: string, role: 'user' | 'admin'): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = role === 'admin' ? 'http://localhost:3000/api/v1/admin/auth/login' : 'http://localhost:3000/api/v1/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);
    if (res.status === 200 && data?.accessToken) {
      return { success: true, message: 'Đăng nhập thành công' };
    }
    return { success: false, message: data?.message || 'Đăng nhập thất bại' };
  } catch (err) {
    return { success: false, message: 'Có lỗi xảy ra' };
  }
}
