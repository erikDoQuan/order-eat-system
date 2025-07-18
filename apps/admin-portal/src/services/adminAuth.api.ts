import axios from 'axios';

export async function adminLogin({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post('/api/v1/admin/auth/login', { email, password });
    // Hỗ trợ cả hai kiểu response: { user, accessToken } và { data: { user, accessToken } }
    const raw = response.data;
    const data = raw.data && (raw.user === undefined && raw.accessToken === undefined) ? raw.data : raw;
    const user = data.user;
    const accessToken = data.accessToken;
    // Chỉ lưu accessToken nếu là admin
    if (accessToken && user && user.role === 'admin') {
      localStorage.setItem('order-eat-access-token', accessToken);
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
    }
    return { user, accessToken };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: true, message: error.response.data.message || 'Đăng nhập thất bại' };
    }
    return { error: true, message: 'Đăng nhập thất bại' };
  }
}