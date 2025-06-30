import React, { useContext } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';

import AccountAdminPage from './admin/AccountAdminPage';
import AdminPage from './admin/AdminPage';
import { AuthContext } from './context/AuthContext';
import AuthProvider from './context/AuthProvider';
import MainLayout from './layouts/MainLayout';
import AccountPage from './pages/AccountPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminCategoryPage from './admin/AdminCategoryPage';
import AdminDishPage from './admin/AdminDishPage';

import './globals.scss';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Thiết lập interceptor cho axios để tự động gửi accessToken
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('order-eat-access-token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Thêm interceptor cho axios để tự động xử lý lỗi 401: nếu gặp lỗi 401 thì xóa accessToken và chuyển hướng về trang /login.
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('order-eat-access-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Các route dùng layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="profile" element={<AccountPage />} />
          </Route>

          {/* Route admin không dùng layout => không bị render Navbar */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AccountAdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/category"
            element={
              <AdminRoute>
                <AdminCategoryPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dishes"
            element={
              <AdminRoute>
                <AdminDishPage />
              </AdminRoute>
            }
          />

          {/* Các route không dùng layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
