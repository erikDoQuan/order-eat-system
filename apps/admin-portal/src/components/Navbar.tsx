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
import NotificationPopup from './NotificationPopup';
import { getOrdersByUserId } from '../services/order.api';

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
  const [showToast, setShowToast] = useState(false);
  const prevConfirmedOrderIds = useRef<string[]>([]);

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
      const notificationsArr = validOrders.sort((a, b) => {
        if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (a.orderNumber && b.orderNumber) return b.orderNumber - a.orderNumber;
        return 0;
      }).map(order => {
        let items = order.orderItems;
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch { items = null; }
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

  // Tự động refetch sau 2 phút nếu popup vẫn mở
  useEffect(() => {
    if (!showNotificationPopup) return;
    const interval = setInterval(() => fetchLatestOrderNotification(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [showNotificationPopup]);

  // Poll for order status changes every 5s when user is logged in
  useEffect(() => {
    if (!user?.id) return;
    const interval = setInterval(() => fetchLatestOrderNotification(true), 5000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    // Lấy danh sách id các đơn đã xác nhận (status === 'Đã xác nhận')
    const confirmedOrders = notifications.filter((n: any) => n.status === 'Đã xác nhận');
    const confirmedIds = confirmedOrders.map((n: any) => String(n.orderId));
    // Nếu có id mới xuất hiện trong danh sách đã xác nhận thì hiện toast
    const newConfirmed = confirmedIds.filter(id => !prevConfirmedOrderIds.current.includes(id));
    if (newConfirmed.length > 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
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
      dropdown: [
        { label: t('bbq_chicken'), path: '/?category=bbq_chicken' },
        { label: t('korean_chicken'), path: '/?category=korean_chicken' },
      ],
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
            // Luôn hiển thị cụm Đăng nhập | Tạo tài khoản | Language, kể cả ở trang login/register
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
                    className="absolute left-0 z-20 w-48 rounded-xl border bg-white opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto shadow-xl transition-all duration-200"
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
          <div
            className="ml-auto flex items-center gap-2 rounded-full border-2 border-white bg-white px-4 py-2 transition hover:shadow-lg"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div
              onClick={() => {
                if (showCartPopup) return; // Nếu đang mở giỏ hàng thì không mở thông báo
                setShowNotificationPopup(v => {
                  const next = !v;
                  if (next && !notificationLoading) fetchLatestOrderNotification();
                  return next;
                });
              }}
              style={{ display: 'inline-block', position: 'relative' }}
            >
              <FaBell size={22} style={{ marginRight: 18, cursor: 'pointer', color: '#C92A15', position: 'relative' }} />
              {hasOrderNotification && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '14px',
                  width: 16,
                  height: 16,
                  background: '#dc2626',
                  borderRadius: '50%',
                  border: '2.5px solid #fff',
                  boxShadow: '0 1px 4px #0002',
                  zIndex: 110,
                  display: 'block',
                }}></span>
              )}
              {showNotificationPopup && (
                <div
                  style={{ position: 'absolute', top: 50, right: 0 }}
                >
                  {notificationLoading ? (
                    <div style={{ width: 320, background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #0003', zIndex: 100, padding: 32, textAlign: 'center', color: '#b45309', fontWeight: 600 }}>Đang tải thông báo...</div>
                  ) : (
                    <NotificationPopup
                      notifications={notifications}
                      onClose={() => setShowNotificationPopup(false)}
                      className="notification-popup"
                    />
                  )}
                </div>
              )}
            </div>
            <div
              onClick={() => {
                if (showNotificationPopup) return; // Nếu đang mở thông báo thì không mở giỏ hàng
                setShowCartPopup(v => !v);
              }}
              style={{ display: 'inline-block', position: 'relative' }}
            >
              <CartIcon />
              {showCartPopup && (
                <CartPopup onClose={() => setShowCartPopup(false)} />
              )}
            </div>
            <span className="text-sm font-bold text-[#a01f10]">{t('cart')}</span>
          </div>
        </div>
      </div>
      {showToast && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 32,
          zIndex: 9999,
          background: '#16a34a',
          color: '#fff',
          fontWeight: 700,
          fontSize: 18,
          borderRadius: 12,
          padding: '16px 32px',
          boxShadow: '0 4px 24px #0002',
          letterSpacing: 0.5,
          transition: 'opacity 0.3s',
        }}>
          Bạn có thông báo mới!
        </div>
      )}
    </nav>
  );
}
