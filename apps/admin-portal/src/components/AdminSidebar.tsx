import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const adminMenu = [
  { label: 'Tổng quan', path: '/admin' },
  { label: 'Quản lý danh mục', path: '/admin/category' },
  { label: 'Quản lý món ăn', path: '/admin/dishes' },
  { label: 'Khách hàng', path: '/admin/customers' },
  { label: 'Đơn hàng', path: '/admin/reports' },
  { label: 'Cài đặt', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer', marginBottom: 32 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, fontSize: 20, color: '#C92A15', textAlign: 'center', marginTop: 8 }}>BẾP CỦA MẸ</div>
      </div>
      <nav>
        <ul className="admin-menu">
          {adminMenu.map(item => (
            <li
              key={item.path}
              className={'admin-menu-item' + (location.pathname === item.path ? ' active' : '')}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
