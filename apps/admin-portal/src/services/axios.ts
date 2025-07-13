import axios from 'axios';

const instance = axios.create({
  baseURL: '/api/v1',
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('order-eat-access-token');
  // Không gửi Authorization cho GET /reviews, GET /orders, POST /reviews và DELETE /reviews (giống orders)
  if (
    token &&
    !(
      (config.method === 'get' &&
        config.url &&
        (config.url === '/reviews' || config.url.startsWith('/reviews?') ||
         config.url === '/orders' || config.url.startsWith('/orders?'))) ||
      (config.method === 'post' &&
        config.url &&
        config.url === '/reviews') ||
      (config.method === 'delete' &&
        config.url &&
        config.url.startsWith('/reviews/'))
    )
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thêm response interceptor để xử lý token hết hạn
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔍 Token expired, redirecting to login...');
      
      // Xóa token và user cũ
      localStorage.removeItem('order-eat-access-token');
      localStorage.removeItem('order-eat-user');
      
      // Redirect về trang login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance; 