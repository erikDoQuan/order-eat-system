// 📁 File: apps/admin-portal/src/main.tsx
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// import DishPage from './pages/DishPage'
// import CategoryPage from './pages/CategoryPage'
// import OrderPage from './pages/OrderPage'
// import DishDetailPage from './pages/DishDetailPage'
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import './globals.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* <Route path="/categories" element={<CategoryPage />} />
        <Route path="/dishes" element={<DishPage />} />
        <Route path="/dishes/:id" element={<DishDetailPage />} />
        <Route path="/orders" element={<OrderPage />} /> */}
      </Routes>
    </MainLayout>
  </BrowserRouter>,
);
