import axios from 'axios';

export async function adminLogin({ email, password }: { email: string; password: string }) {
  try {
    const response = await axios.post('/api/v1/admin/auth/login', { email, password });
    const data = response.data;
    // Chuẩn hóa trả về firstName, lastName nếu backend trả về name
    let user = data.user;
    if (user && user.name && (!user.firstName || !user.lastName)) {
      const [firstName, ...lastNameArr] = user.name.split(' ');
      user.firstName = firstName;
      user.lastName = lastNameArr.join(' ');
    }
    // Lưu accessToken vào localStorage để giữ đăng nhập admin khi reload
    if (data.accessToken) {
      localStorage.setItem('order-eat-access-token', data.accessToken);
    }
    return { ...data, user };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { error: true, message: error.response.data.message || 'Đăng nhập thất bại' };
    }
    return { error: true, message: 'Đăng nhập thất bại' };
  }
}
