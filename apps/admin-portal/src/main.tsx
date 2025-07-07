import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminCategoryPage from './admin/AdminCategoryPage';
import AdminDishPage from './admin/AdminDishPage';
import AdminUserPage from './admin/AdminUserPage';
import AdminPage from './admin/AdminPage';
import AccountAdminPage from './admin/AccountAdminPage';
import CheckoutPage from './pages/CheckoutPage';
import AuthProvider from './context/AuthProvider';
import { AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import OrderTypePage from './pages/OrderTypePage';
import OrderInfoPage from './pages/OrderInfoPage';
import PaymentInfoPage from './pages/payment-info';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderAdminPage from './admin/OrderAdminPage';

import './globals.scss';

declare global {
  interface Window {
    __REACT_ROUTER_DISABLE_WARNINGS?: boolean;
  }
}

// Đảm bảo axios luôn gửi access token trong header Authorization mỗi lần app khởi động
const accessToken = localStorage.getItem('order-eat-access-token');
if (accessToken) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
}

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('order-eat-refresh-token');
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axios(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          const res = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = res.data;
          localStorage.setItem('order-eat-access-token', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('order-eat-refresh-token', newRefreshToken);
          }
          axios.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
          processQueue(null, accessToken);
          originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;
          return axios(originalRequest);
        } catch (err) {
          processQueue(err, null);
          localStorage.removeItem('order-eat-access-token');
          localStorage.removeItem('order-eat-refresh-token');
          window.location.href = '/login';
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('order-eat-access-token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppWithCartProvider() {
  // const { user } = useContext(AuthContext);
  // Luôn render CartProvider, không cần truyền userId
  return (
    <CartProvider>
      <Routes>
        {/* Các route dùng layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="profile" element={<AccountPage />} />
        </Route>
        {/* Route admin không dùng layout => không bị render Navbar */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AccountAdminPage /></AdminRoute>} />
        <Route path="/admin/category" element={<AdminRoute><AdminCategoryPage /></AdminRoute>} />
        <Route path="/admin/dishes" element={<AdminRoute><AdminDishPage /></AdminRoute>} />
        <Route path="/admin/dishes/add" element={<AdminRoute><AdminDishPage showAddForm={true} /></AdminRoute>} />
        <Route path="/admin/customers" element={<AdminRoute><AdminUserPage /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><OrderAdminPage /></AdminRoute>} />
        {/* Các route không dùng layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-type" element={<OrderTypePage />} />
        <Route path="/order-info" element={<OrderInfoPage />} />
        <Route path="/payment-info" element={<PaymentInfoPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
      </Routes>
    </CartProvider>
  );
}

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing in index.html');

// Use a global variable to avoid duplicate createRoot in HMR/dev
// @ts-ignore
if (!window.__REACT_ROOT__) {
  // @ts-ignore
  window.__REACT_ROOT__ = ReactDOM.createRoot(container);
}
// @ts-ignore
const root = window.__REACT_ROOT__;
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppWithCartProvider />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
