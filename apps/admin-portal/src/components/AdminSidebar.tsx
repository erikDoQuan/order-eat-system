import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';

const adminMenu = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Category Management', path: '/admin/category' },
  { label: 'Dish Management', path: '/admin/dishes' },
  { label: 'User Management', path: '/admin/customers' },
  { label: 'Order Management', path: '/admin/orders' },
  { label: 'User Transaction Management', path: '/admin/user-transaction' },
  { label: 'Review Management', path: '/admin/reviews' },
  { label: 'Revenue Reports', path: '/admin/revenue-reports' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);
  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo" onClick={() => navigate('/admin')} style={{ cursor: 'pointer', marginBottom: 32 }}>
        <img src="/logo.png" alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, margin: '0 auto' }} />
        <div style={{ fontWeight: 700, fontSize: 20, color: '#C92A15', textAlign: 'center', marginTop: 8 }}>BEP CUAME ADMIN</div>
      </div>
      <nav style={{ flex: 1 }}>
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
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingBottom: 0 }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            background: '#e53935',
            border: 'none',
            cursor: 'pointer',
            color: '#fff',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            fontSize: 16,
            fontWeight: 500,
            gap: 8,
            borderRadius: 0,
            padding: '16px 0',
            boxShadow: 'none',
            transition: 'background 0.2s',
            justifyContent: 'center',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#c62828')}
          onMouseOut={e => (e.currentTarget.style.background = '#e53935')}
        >
          <LogOut size={22} color="#fff" />
          <span style={{ fontSize: 16, color: '#fff' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
