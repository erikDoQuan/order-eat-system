import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { LogOut, ShoppingCart, User as UserIcon } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { AuthContext } from '../context/AuthContext';
import { CartIcon } from './CartIcon';
import { CartPopup } from './CartPopup';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import LanguageSwitcher from './LanguageSwitcher';
import { FaBell } from 'react-icons/fa';

import '../css/Navbar.css';

export default function Navbar() {
  const { user, setUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [showMenu, setShowMenu] = useState(false);
  const userIconRef = useRef<HTMLDivElement>(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { fetchCart } = useCart();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [dishes, setDishes] = useState<any[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userIconRef.current && !userIconRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  useEffect(() => {
    getAllDishes().then(d => setDishes(d || []));
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('order-eat-access-token');
    setShowMenu(false);
    navigate('/', { replace: true });
  };

  const handleOpenCart = () => {
    if (user?.id) {
      setCartLoading(true);
      fetchCart().finally(() => setCartLoading(false));
    }
    setShowCartPopup(true);
  };

  // Menu phải nằm trong function component để dùng được t
  const navItems = [
    {
      label: t('pizza'),
      path: '/',
      dropdown: [
        { label: t('seafood_pizza'), path: '/dishes' },
        { label: t('traditional_pizza'), path: '/dishes/new' },
        { label: t('vegetarian_pizza'), path: '/dishes/new' },
        { label: t('combo_pizza'), path: '/dishes/new' },
      ],
    },
    { label: t('spaghetti'), path: '/categories' },
    { label: t('baked_macaroni'), path: '/orders' },
    {
      label: t('chicken'),
      path: '/Gà',
      dropdown: [
        { label: t('bbq_chicken'), path: '/dishes' },
        { label: t('korean_chicken'), path: '/dishes/new' },
      ],
    },
    { label: t('appetizer'), path: '/orders' },
    { label: t('salad'), path: '/orders' },
    { label: t('drink'), path: '/orders' },
  ];

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b border-transparent bg-white/90 shadow-lg backdrop-blur"
      style={{ boxShadow: '0 2px 12px 0 #C92A1520' }}
    >
      {/* Dòng trên: logo + tên + user + đăng nhập */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex min-w-[220px] items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-11 w-11 cursor-pointer rounded-full border-2 border-[#C92A15] bg-white object-contain shadow"
            onClick={() => navigate('/')}
          />
          <span className="cursor-pointer text-2xl font-extrabold tracking-wide" style={{ color: '#C92A15' }} onClick={() => navigate('/')}>
            BẾP CỦA MẸ
          </span>
        </div>
        <div className="flex min-w-[180px] items-center justify-end gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <div
                ref={userIconRef}
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]"
                onClick={() => setShowMenu(v => !v)}
              >
                <UserIcon size={20} />
                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/profile');
                      }}
                    >
                      <UserIcon size={18} className="text-gray-500" />
                      {t('account')}
                    </button>
                    <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                      <LogOut size={18} className="text-red-400" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
              <span className="text-base font-semibold text-black" style={{ cursor: 'pointer' }}>
                {user.firstName || ''} {user.lastName || ''}
                {!(user.firstName || user.lastName) && user.email}
              </span>
              <span style={{ margin: '0 8px', color: '#ccc', fontWeight: 600 }}>|</span>
              <LanguageSwitcher />
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-1">
                <NavLink
                  to="/login"
                  className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-base font-semibold transition hover:bg-[#e6f4ed]"
                  style={{ fontWeight: 500 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '2px solid #C92A15', background: '#e6f4ed', color: '#C92A15', marginRight: 8 }}>
                    <UserIcon size={24} />
                  </span>
                  {t('login')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-xl bg-transparent py-2 text-base font-semibold transition hover:bg-[#e6f4ed]"
                  style={{ fontWeight: 500 }}
                >
                  {t('register')}
                </NavLink>
                <span style={{ margin: '0 8px', color: '#ccc', fontWeight: 600 }}>|</span>
                <LanguageSwitcher />
              </div>
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
                      <li key={drop.path + '-' + drop.label}>
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
                <li key={item.path + '-' + item.label}>
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
          <div className="ml-auto flex items-center gap-2 rounded-full border-2 border-white bg-white px-4 py-2 transition hover:shadow-lg" style={{ cursor: 'pointer', position: 'relative' }} onClick={handleOpenCart}>
            <FaBell size={22} style={{ marginRight: 18, cursor: 'pointer', color: '#C92A15' }} />
            <CartIcon />
            <span className="text-sm font-bold text-[#a01f10]">{t('cart')}</span>
            {showCartPopup && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.1)',
                    zIndex: 99,
                  }}
                  onClick={() => setShowCartPopup(false)}
                />
                <CartPopup
                  onClose={() => setShowCartPopup(false)}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
