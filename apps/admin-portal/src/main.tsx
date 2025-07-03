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

import './globals.scss';

axios.interceptors.request.use((config) => {
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

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useContext(AuthContext);
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppWithCartProvider() {
  const { user } = useContext(AuthContext);
  // Luôn render CartProvider, truyền userId nếu có
  return (
    <CartProvider userId={user?.id}>
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
        {/* Các route không dùng layout */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
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
