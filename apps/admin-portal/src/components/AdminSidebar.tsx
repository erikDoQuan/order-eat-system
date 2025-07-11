import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const adminMenu = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Category Management', path: '/admin/category' },
  { label: 'Dish Management', path: '/admin/dishes' },
  { label: 'User Management', path: '/admin/customers' },
  { label: 'Order Management', path: '/admin/orders' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer', marginBottom: 32 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, fontSize: 20, color: '#C92A15', textAlign: 'center', marginTop: 8 }}>BEP CUAME ADMIN</div>
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
