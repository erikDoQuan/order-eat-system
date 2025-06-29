import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

import '../css/AdminSidebar.css';

export default function AdminPage() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.name || user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : user?.email}
                </h1>
              </div>
              <button onClick={handleLogout} className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                Đăng xuất
              </button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                    <span className="text-sm font-medium text-white">🍕</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng món ăn</p>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                    <span className="text-sm font-medium text-white">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đơn hàng hôm nay</p>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500">
                    <span className="text-sm font-medium text-white">💰</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Doanh thu hôm nay</p>
                  <p className="text-2xl font-semibold text-gray-900">2.4M</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                    <span className="text-sm font-medium text-white">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Khách hàng mới</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">Thao tác nhanh</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <button className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                    <span className="text-lg text-blue-600">➕</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Thêm món ăn</p>
                    <p className="text-xs text-gray-500">Tạo món ăn mới</p>
                  </div>
                </div>
              </button>
              <button className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                    <span className="text-lg text-green-600">📋</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Quản lý đơn hàng</p>
                    <p className="text-xs text-gray-500">Xem và xử lý đơn hàng</p>
                  </div>
                </div>
              </button>
              <button className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-100">
                    <span className="text-lg text-yellow-600">📊</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Báo cáo</p>
                    <p className="text-xs text-gray-500">Xem báo cáo doanh thu</p>
                  </div>
                </div>
              </button>
              <button className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
                    <span className="text-lg text-purple-600">⚙️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Cài đặt</p>
                    <p className="text-xs text-gray-500">Cấu hình hệ thống</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Đơn hàng gần đây</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map(order => (
                  <div key={order} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Đơn hàng #{1000 + order}</p>
                      <p className="text-xs text-gray-500">Pizza Hải Sản, Gà Nướng</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">450,000đ</p>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        Hoàn thành
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
