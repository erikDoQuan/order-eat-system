import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { LogOut, ShoppingCart, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaBell } from 'react-icons/fa';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import { getOrdersByUserId } from '../services/order.api';
import { CartIcon } from './CartIcon';
import { CartPopup } from './CartPopup';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationPopup from './NotificationPopup';

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
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [hasOrderNotification, setHasOrderNotification] = useState(false);
  const [notificationHover, setNotificationHover] = useState(false);
  const ordersCache = useRef<{ data: any[]; timestamp: number } | null>(null);
  const dishesCache = useRef<{ data: any[]; timestamp: number } | null>(null);
  const CACHE_DURATION = 2 * 60 * 1000; // 2 phút
  const prevConfirmedOrderIds = useRef<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Fetch latest order and dishes for notification
  const fetchLatestOrderNotification = async (force = false) => {
    if (!user?.id) return;
    const now = Date.now();
    setNotificationLoading(true);
    try {
      let orders: any[] = [];
      let dishes: any[] = [];
      // Kiểm tra cache orders
      if (!force && ordersCache.current && now - ordersCache.current.timestamp < CACHE_DURATION) {
        orders = ordersCache.current.data;
      } else {
        orders = await getOrdersByUserId(user.id);
        ordersCache.current = { data: orders, timestamp: now };
      }
      // Kiểm tra cache dishes
      if (!force && dishesCache.current && now - dishesCache.current.timestamp < CACHE_DURATION) {
        dishes = dishesCache.current.data;
      } else {
        dishes = await getAllDishes();
        dishesCache.current = { data: dishes, timestamp: now };
      }
      // Lọc ra các đơn đã xác nhận hoặc hoàn thành
      const validOrders = orders.filter((o: any) => o.status === 'confirmed' || o.status === 'completed');
      setHasOrderNotification(validOrders.length > 0);
      if (!validOrders.length) {
        setNotifications([]);
        setNotificationLoading(false);
        return;
      }
      // Map từng order thành notification
      const notificationsArr = validOrders
        .sort((a, b) => {
          if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          if (a.orderNumber && b.orderNumber) return b.orderNumber - a.orderNumber;
          return 0;
        })
        .map(order => {
          let items = order.orderItems;
          if (typeof items === 'string') {
            try {
              items = JSON.parse(items);
            } catch {
              items = null;
            }
          }
          const products = (items?.items || []).map((item: any) => {
            const dish = dishes.find((d: any) => d.id === item.dishId);
            return {
              name: dish ? dish.name : item.dishId,
              quantity: item.quantity || 1,
            };
          });
          return {
            orderId: order.orderNumber || order.id,
            products,
            date: order.createdAt || new Date().toISOString(),
            total: Number(order.totalAmount) || 0,
            status: order.status === 'completed' ? 'Hoàn thành' : 'Đã xác nhận',
          };
        });
      setNotifications(notificationsArr);
    } catch (e) {
      setNotifications([]);
      setHasOrderNotification(false);
    }
    setNotificationLoading(false);
  };

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

  useEffect(() => {
    // Lấy danh sách id các đơn đã xác nhận (status === 'Đã xác nhận')
    const confirmedOrders = notifications.filter((n: any) => n.status === 'Đã xác nhận');
    const confirmedIds = confirmedOrders.map((n: any) => String(n.orderId));
    // Nếu có id mới xuất hiện trong danh sách đã xác nhận thì hiện toast
    const newConfirmed = confirmedIds.filter(id => !prevConfirmedOrderIds.current.includes(id));
    if (newConfirmed.length > 0) {
      // setShowToast(true); // Removed as per edit hint
      // setTimeout(() => setShowToast(false), 5000); // Removed as per edit hint
    }
    prevConfirmedOrderIds.current = confirmedIds;
  }, [notifications]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('order-eat-access-token');
    setShowMenu(false);
    setShowNotificationPopup(false);
    setNotifications([]);
    navigate('/', { replace: true });
  };

  const handleOpenCart = () => {
    if (user?.id) {
      setCartLoading(true);
      fetchCart().finally(() => setCartLoading(false));
    }
    setShowCartPopup(true);
  };

  const handleNotificationClick = () => {
    if (!showNotificationPopup) {
      fetchLatestOrderNotification();
    }
    setShowNotificationPopup(v => !v);
  };

  const handleCloseNotification = () => {
    setShowNotificationPopup(false);
    // Không xóa notifications để lần sau mở nhanh
  };

  // Menu phải nằm trong function component để dùng được t
  const navItems = [
    {
      label: t('pizza'),
      path: '/?category=pizza',
      dropdown: [
        { label: t('seafood_pizza'), path: '/?category=pizza&type=seafood' },
        { label: t('traditional_pizza'), path: '/?category=pizza&type=traditional' },
        { label: t('vegetarian_pizza'), path: '/?category=pizza&type=vegetarian' },
        { label: t('combo_pizza'), path: '/?category=pizza&type=combo' },
      ],
    },
    {
      label: t('spaghetti'),
      path: '/?category=spaghetti',
    },
    {
      label: t('baked_macaroni'),
      path: '/?category=baked_macaroni',
    },
    {
      label: t('chicken'),
      path: '/?category=chicken',
    },
    {
      label: t('appetizer'),
      path: '/?category=appetizer',
    },
    {
      label: t('salad'),
      path: '/?category=salad',
    },
    {
      label: t('drink'),
      path: '/?category=drink',
    },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-transparent bg-white shadow-lg" style={{ boxShadow: '0 2px 12px 0 #C92A1520' }}>
      {/* Dòng trên: logo + tên + user + đăng nhập */}
      <div className="w-full px-4 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-t-3xl bg-white py-3">
          <div className="flex min-w-[180px] items-center gap-3 md:min-w-[220px]">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-9 w-9 cursor-pointer rounded-full border-2 border-[#C92A15] bg-white object-contain shadow md:h-11 md:w-11"
              onClick={() => navigate('/')}
            />
            <span
              className="cursor-pointer text-lg font-extrabold tracking-wide md:text-2xl"
              style={{ color: '#C92A15' }}
              onClick={() => navigate('/')}
            >
              BẾP CỦA MẸ
            </span>
          </div>
          <div className="flex min-w-[140px] items-center justify-end gap-2 md:min-w-[180px] md:gap-4">
            {isAuthPage ? (
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
              </div>
            ) : user ? (
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
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                        onClick={() => setShowLogoutConfirm(true)}
                      >
                        <LogOut size={18} className="text-red-400" />
                        {t('logout')}
                      </button>
                    </div>
                  )}
                </div>
                <span className="hidden text-base font-semibold text-black md:inline" style={{ cursor: 'pointer' }}>
                  {user.firstName || user.lastName
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : user.name
                      ? user.name
                      : user.email
                        ? user.email
                        : user.id || ''}
                </span>
                <span style={{ margin: '0 8px', color: '#ccc', fontWeight: 600 }}>|</span>
                <LanguageSwitcher />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                {!(isAuthPage && isMobile) ? (
                  <>
                    <NavLink
                      to="/login"
                      className="flex items-center gap-2 rounded-xl bg-transparent px-4 py-2 text-base font-semibold transition hover:bg-[#e6f4ed]"
                      style={{ fontWeight: 500 }}
                    >
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          border: '2px solid #C92A15',
                          background: '#e6f4ed',
                          color: '#C92A15',
                          marginRight: 8,
                        }}
                      >
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
                  </>
                ) : null}
                <LanguageSwitcher />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dòng dưới: nav menu + giỏ hàng */}
      <div className="w-full px-4 pb-2 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex w-full items-center justify-between rounded-[15px] bg-[#C92A15] py-2 shadow">
            {/* Hamburger menu cho mobile */}
            <button className="mr-2 block text-2xl text-white md:hidden" onClick={() => setShowMobileMenu(true)}>
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Menu trung tâm - ẩn trên mobile */}
            <ul className="hidden max-w-[80%] flex-wrap items-center gap-x-3 text-sm font-semibold text-white md:flex">
              {navItems.map(item =>
                item.dropdown ? (
                  <li key={item.label} className="group relative">
                    <button type="button" className="group relative flex items-center rounded-lg px-3 py-1.5 transition hover:bg-[#a01f10]">
                      {item.label}
                      <svg className="ml-1 h-4 w-4" fill="none" stroke="#fff" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {item.label}
                      </span>
                    </button>
                    <ul
                      className="pointer-events-none absolute left-0 z-20 w-48 rounded-xl border bg-white opacity-0 shadow-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100"
                      style={{ borderColor: '#C92A15', top: '100%' }}
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
                        `group relative rounded-xl px-3 py-1.5 transition hover:bg-[#a01f10] ${isActive ? 'font-bold text-white' : 'text-white'}`
                      }
                    >
                      {item.label}
                      <span className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                ),
              )}
            </ul>
            {/* Overlay menu mobile */}
            {showMobileMenu && (
              <>
                <style>{`body { overflow: hidden !important; }`}</style>
                <div className="fixed inset-0 z-[9999] flex md:hidden">
                  {/* Overlay mờ */}
                  <div className="fixed inset-0 bg-black/40" onClick={() => setShowMobileMenu(false)} />
                  {/* Sidebar */}
                  <div
                    className="fixed left-0 top-0 z-[10000] flex h-screen w-4/5 max-w-xs flex-col bg-[#C92A15] shadow-xl"
                    style={{ animation: 'slideInLeft 0.25s' }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      className="absolute right-4 top-4 text-3xl font-bold text-white"
                      onClick={() => setShowMobileMenu(false)}
                      aria-label="Đóng menu"
                    >
                      &times;
                    </button>
                    <ul className="mt-16 flex flex-col gap-2 px-4">
                      {navItems.map(item =>
                        item.dropdown ? (
                          <li key={item.label} className="w-full">
                            <button
                              className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-base font-bold text-white hover:bg-white/10 focus:outline-none"
                              onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                              type="button"
                            >
                              <span>{item.label}</span>
                              <svg
                                className={`ml-2 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`}
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M6 8L10 12L14 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            {openDropdown === item.label && (
                              <ul className="ml-2 flex flex-col gap-1">
                                {item.dropdown.map(drop => (
                                  <li key={drop.path + '-' + drop.label} className="w-full">
                                    <NavLink
                                      to={drop.path}
                                      className="block w-full rounded px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                                      onClick={() => setShowMobileMenu(false)}
                                    >
                                      {drop.label}
                                    </NavLink>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ) : (
                          <li key={item.path + '-' + item.label} className="w-full">
                            <NavLink
                              to={item.path}
                              end={item.path === '/'}
                              className="block w-full rounded px-3 py-2 text-left text-base font-semibold text-white hover:bg-white/10"
                              onClick={() => setShowMobileMenu(false)}
                            >
                              {item.label}
                            </NavLink>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}

            {/* Giỏ hàng nằm phía cuối bên phải (ĐÃ SỬA: thêm border-radius đẹp) */}
            <div
              className="ml-auto mr-4 flex items-center gap-0 rounded-full border-2 border-white bg-white px-6 py-2 transition hover:shadow-lg"
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div onClick={handleNotificationClick} style={{ display: 'inline-block', position: 'relative' }}>
                <FaBell size={22} style={{ marginRight: 24, cursor: 'pointer', color: '#C92A15', position: 'relative' }} />
                {showNotificationPopup && (
                  <div style={{ position: 'absolute', top: 50, right: 0 }}>
                    <NotificationPopup
                      notifications={notifications}
                      onClose={handleCloseNotification}
                      className="notification-popup"
                      loading={notificationLoading}
                    />
                  </div>
                )}
              </div>
              <div
                onClick={() => {
                  if (showNotificationPopup) return;
                  setShowCartPopup(v => !v);
                }}
                style={{ display: 'inline-block', position: 'relative' }}
              >
                <CartIcon />
                {showCartPopup && (
                  <>
                    {/* Overlay để xử lý click ra ngoài */}
                    <div
                      onClick={() => setShowCartPopup(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 99,
                      }}
                    />
                    <CartPopup onClose={() => setShowCartPopup(false)} />
                  </>
                )}
              </div>
              <span className="text-sm font-bold text-[#a01f10]">{t('cart')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Popup xác nhận đăng xuất */}
      {showLogoutConfirm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 4px 24px #0002',
              padding: '32px 32px 24px 32px',
              minWidth: 320,
              maxWidth: '90vw',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 18 }}>Bạn có chắc muốn đăng xuất không?</div>
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                style={{
                  background: '#C92A15',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 32px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #C92A1533',
                  marginRight: 8,
                }}
              >
                Có
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  background: '#f3f4f6',
                  color: '#222',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 32px',
                  fontWeight: 700,
                  fontSize: 18,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #0001',
                }}
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
