import { useContext } from 'react';
import { ShoppingCart, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-transparent bg-white/90 shadow-lg backdrop-blur"
      style={{ boxShadow: '0 2px 12px 0 #C92A1520' }}
    >
      {/* Dòng trên: logo + tên + user + đăng nhập */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex min-w-[220px] items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-11 w-11 rounded-full border-2 border-[#C92A15] bg-white object-contain shadow" />
          <span className="text-2xl font-extrabold tracking-wide" style={{ color: '#C92A15' }}>
            BẾP CỦA MẸ
          </span>
        </div>
        <div className="flex min-w-[180px] items-center justify-end gap-4">
          <div className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]">
            <User size={20} />
          </div>
          {user ? (
            <span className="ml-2 text-base font-semibold text-primary">{user.firstName || user.email}</span>
          ) : (
            !isAuthPage && (
              <>
                <NavLink to="/login" className="ml-2 rounded-xl bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-[#e6f4ed]">
                  Đăng nhập
                </NavLink>
                <NavLink to="/register" className="ml-2 rounded-xl bg-transparent px-4 py-2 text-sm font-semibold transition hover:bg-[#e6f4ed]">
                  Tạo tài khoản
                </NavLink>
              </>
            )
          )}
        </div>
      </div>

      {/* Dòng dưới: nav menu + giỏ hàng */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pb-2">
        <div className="flex w-full items-center justify-between rounded-[15px] bg-[#C92A15] px-4 py-2 shadow">
          {/* Menu trung tâm */}
          <ul className="flex max-w-[80%] flex-wrap items-center gap-x-3 text-sm font-semibold text-white">
            {navItems.map(item =>
              item.dropdown ? (
                <li key={item.label} className="group relative">
                  <button type="button" className="flex items-center rounded-lg px-3 py-1.5 transition hover:bg-[#a01f10]">
                    {item.label}
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="#fff" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <ul
                    className="pointer-events-none absolute left-0 z-20 mt-2 w-48 rounded-xl border bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-1 group-hover:opacity-100"
                    style={{ borderColor: '#C92A15' }}
                  >
                    {item.dropdown.map(drop => (
                      <li key={drop.path}>
                        <NavLink
                          to={drop.path}
                          className={({ isActive }) =>
                            `block rounded-xl px-5 py-3 transition hover:bg-[#e6f4ed] ${isActive ? 'font-bold text-[#C92A15]' : 'text-[#C92A15]'}`
                          }
                        >
                          {drop.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-1.5 transition hover:bg-[#a01f10] ${isActive ? 'font-bold text-white' : 'text-white'}`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ),
            )}
          </ul>

          {/* Giỏ hàng nằm phía cuối bên phải (ĐÃ SỬA: thêm border-radius đẹp) */}
          <NavLink
            to="/cart"
            className="ml-auto flex items-center gap-2 rounded-full border-2 border-white bg-white px-4 py-2 transition hover:shadow-lg"
          >
            <ShoppingCart size={20} className="text-[#C92A15]" />
            <span className="text-sm font-bold text-[#a01f10]">Giỏ hàng</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

// Menu
const navItems = [
  {
    label: 'Pizza',
    path: '/',
    dropdown: [
      { label: 'Pizza Hải Sản', path: '/dishes' },
      { label: 'Pizza Truyền thống', path: '/dishes/new' },
      { label: 'Pizza chay', path: '/dishes/new' },
      { label: 'Pizza thập cẩm', path: '/dishes/new' },
    ],
  },
  { label: 'Mỳ Ý', path: '/categories' },
  { label: 'Nui Bỏ Lò', path: '/orders' },
  {
    label: 'Gà',
    path: '/Gà',
    dropdown: [
      { label: 'Gà BBQ', path: '/dishes' },
      { label: 'Gà Hàn Quốc', path: '/dishes/new' },
    ],
  },
  { label: 'Khai vị', path: '/orders' },
  { label: 'Salad', path: '/orders' },
  { label: 'Thức uống', path: '/orders' },
];
