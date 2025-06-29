// src/admin/AdminPage.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

import '../css/AdminSidebar.css';

export default function AdminPage() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  /* -------------------- dropdown state & helpers -------------------- */
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  /* đóng menu khi click ra ngoài */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email;


  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 p-6">

        <div className="relative mb-8 flex items-center justify-end gap-3">
   
          <div
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]"
            onClick={() => setShowMenu(v => !v)}
            ref={menuRef}
          >
            <User size={20} />
   
            {user && showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/admin/profile');

                  }}
                >
                  <User size={18} className="text-gray-500" />
                  Tài khoản
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                  <LogOut size={18} className="text-red-400" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
   
          <span className="ml-2 text-base font-semibold text-black underline underline-offset-2 hover:text-blue-700" style={{ cursor: 'pointer' }}>
            {user?.firstName || ''} {user?.lastName || ''}
            {!(user?.firstName || user?.lastName) && user?.email}
          </span>
        </div>


        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Tổng món ăn', value: 24, bg: 'bg-blue-500', icon: '🍕' },
            { label: 'Đơn hàng hôm nay', value: 12, bg: 'bg-green-500', icon: '📦' },
            { label: 'Doanh thu hôm nay', value: '2.4 M', bg: 'bg-yellow-500', icon: '💰' },
            { label: 'Khách hàng mới', value: 8, bg: 'bg-purple-500', icon: '👥' },
          ].map(card => (
            <div key={card.label} className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
                    <span className="text-sm font-medium text-white">{card.icon}</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{card.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- QUICK ACTIONS ---------- */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-medium text-gray-900">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Thêm món ăn',
                subtitle: 'Tạo món ăn mới',
                icon: '➕',
                bg: 'bg-blue-100',
                color: 'text-blue-600',
              },
              {
                title: 'Quản lý đơn hàng',
                subtitle: 'Xem và xử lý đơn hàng',
                icon: '📋',
                bg: 'bg-green-100',
                color: 'text-green-600',
              },
              {
                title: 'Báo cáo',
                subtitle: 'Xem báo cáo doanh thu',
                icon: '📊',
                bg: 'bg-yellow-100',
                color: 'text-yellow-600',
              },
              {
                title: 'Cài đặt',
                subtitle: 'Cấu hình hệ thống',
                icon: '⚙️',
                bg: 'bg-purple-100',
                color: 'text-purple-600',
              },
            ].map(action => (
              <button key={action.title} className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-md ${action.bg}`}>
                    <span className={`text-lg ${action.color}`}>{action.icon}</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{action.title}</p>
                    <p className="text-xs text-gray-500">{action.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- RECENT ORDERS ---------- */}
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
                    <p className="text-sm font-medium text-gray-900">450 000 đ</p>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Hoàn thành
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
