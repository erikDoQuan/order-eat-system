// src/admin/AdminPage.tsx
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { Link, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { getAllDishes } from '../services/dish.api';
import { getAllOrders } from '../services/order.api';
import { getAllUsers } from '../services/user.api';
import SettingAdminPage from './SettingAdminPage';

import '../css/AdminSidebar.css';

// Lazy load các components không quan trọng
const LazyQuickOrderPage = React.lazy(() => import('./QuickOrderPage'));
const LazyOrderAdminPage = React.lazy(() => import('./OrderAdminPage'));
const LazyAdminUserPage = React.lazy(() => import('./AdminUserPage'));
const LazyReviewAdminPage = React.lazy(() => import('./ReviewAdminPage'));
const LazyRevenueReportsPage = React.lazy(() => import('./RevenueReportsPage'));
const LazyAdminDishPage = React.lazy(() => import('./AdminDishPage'));
const LazyAdminCategoryPage = React.lazy(() => import('./AdminCategoryPage'));
const LazyUserTransactionAdminPage = React.lazy(() => import('./UserTransactionAdminPage'));

// Cache data để tránh load lại
interface DashboardData {
  dishCount: number;
  userCount: number;
  todayOrderCount: number;
  todayRevenue: number;
  recentOrders: any[];
  recentDishes: any[];
}

const dashboardCache: {
  data: DashboardData | null;
  timestamp: number;
  cacheDuration: number;
} = {
  data: null,
  timestamp: 0,
  cacheDuration: 60000, // 1 phút
};

// Skeleton Loading Component
const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 rounded-lg bg-gray-200 p-6"></div>
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-64 rounded-lg bg-gray-200 p-6"></div>
      <div className="h-64 rounded-lg bg-gray-200 p-6"></div>
    </div>
  </div>
);

export default function AdminPage() {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  /* -------------------- dropdown state & helpers -------------------- */
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [dishCount, setDishCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [todayOrderCount, setTodayOrderCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentDishes, setRecentDishes] = useState<any[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);

  // Preload các routes quan trọng khi user hover vào quick actions
  const preloadRoute = useCallback((route: string) => {
    switch (route) {
      case '/admin/dishes/add':
        import('./AdminDishPage');
        break;
      case '/admin/orders':
        import('./OrderAdminPage');
        break;
      case '/admin/revenue-reports':
        import('./RevenueReportsPage');
        break;
      case '/admin/quick-orders':
        import('./QuickOrderPage');
        break;
    }
  }, []);

  // Memoize expensive calculations
  const todayRevenueFormatted = useMemo(() => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(todayRevenue);
  }, [todayRevenue]);

  const recentOrdersFormatted = useMemo(() => {
    return recentOrders.map(order => ({
      ...order,
      formattedAmount: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(order.totalAmount || 0),
    }));
  }, [recentOrders]);

  // Tối ưu hóa load data với cache
  const loadDashboardData = useCallback(async () => {
    const now = Date.now();

    // Kiểm tra cache
    if (dashboardCache.data && now - dashboardCache.timestamp < dashboardCache.cacheDuration) {
      const cached = dashboardCache.data;
      setDishCount(cached.dishCount);
      setUserCount(cached.userCount);
      setTodayOrderCount(cached.todayOrderCount);
      setTodayRevenue(cached.todayRevenue);
      setRecentOrders(cached.recentOrders);
      setRecentDishes(cached.recentDishes);
      setDashboardLoading(false);
      return;
    }

    setDashboardLoading(true);
    try {
      // Load data song song để tăng tốc - chỉ load data cần thiết
      const [dishes, usersRes, orders] = await Promise.all([
        getAllDishes(), // Có thể thêm limit nếu cần
        getAllUsers(1, 100), // Giảm từ 1000 xuống 100
        getAllOrders(), // Có thể thêm limit nếu cần
      ]);

      // Tính toán data
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayOrders = orders.filter((o: any) => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt);
        return orderDate >= todayStart && orderDate < todayEnd;
      });

      const filteredUsers = usersRes.users.filter(u => (u.role === 'user' || u.role === 'USER') && u.isActive === true);

      const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

      // Cache data
      const dashboardData = {
        dishCount: dishes.length,
        userCount: filteredUsers.length,
        todayOrderCount: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.totalAmount) || 0), 0),
        recentOrders: sortedOrders,
        recentDishes: dishes,
      };

      dashboardCache.data = dashboardData;
      dashboardCache.timestamp = now;

      // Set state
      setDishCount(dashboardData.dishCount);
      setUserCount(dashboardData.userCount);
      setTodayOrderCount(dashboardData.todayOrderCount);
      setTodayRevenue(dashboardData.todayRevenue);
      setRecentOrders(dashboardData.recentOrders);
      setRecentDishes(dashboardData.recentDishes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') return null;

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

  const getDishName = (dishId: string) => {
    const dish = recentDishes.find((d: any) => d.id === dishId);
    return dish ? dish.name : dishId;
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivering':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusMap: any = {
    completed: 'Completed',
    confirmed: 'Confirmed',
    delivering: 'Delivering',
    preparing: 'Preparing',
    pending: 'Pending',
    cancelled: 'Cancelled',
  };

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
        {location.pathname === '/admin' ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#C92A15]">Dashboard</h1>
            </div>
            {dashboardLoading ? (
              <DashboardSkeleton />
            ) : (
              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: 'Total Dishes',
                    value: dishCount,
                    bg: 'bg-blue-500',
                    icon: '🍕',
                  },
                  {
                    label: "Today's Orders",
                    value: todayOrderCount,
                    bg: 'bg-green-500',
                    icon: '📦',
                  },
                  {
                    label: "Today's Revenue",
                    value: todayRevenueFormatted,
                    bg: 'bg-yellow-500',
                    icon: '💰',
                  },
                  {
                    label: 'New Customer',
                    value: userCount,
                    bg: 'bg-purple-500',
                    icon: '👥',
                  },
                ].map(card => (
                  <div key={card.label} className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="flex items-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-md ${card.bg}`}>
                        <span className="text-sm font-medium text-white">{card.icon}</span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">{card.label}</p>
                        <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* ---------- QUICK ACTIONS ---------- */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    title: 'Add Dish',
                    subtitle: 'Create a new dish',
                    icon: '➕',
                    bg: 'bg-blue-100',
                    color: 'text-blue-600',
                    onClick: () => navigate('/admin/dishes/add'),
                  },
                  {
                    title: 'Order Management',
                    subtitle: 'View and process orders',
                    icon: '📋',
                    bg: 'bg-green-100',
                    color: 'text-green-600',
                    onClick: () => navigate('/admin/orders'),
                  },
                  {
                    title: 'Report',
                    subtitle: 'View revenue reports',
                    icon: '📊',
                    bg: 'bg-yellow-100',
                    color: 'text-yellow-600',
                    onClick: () => navigate('/admin/revenue-reports'),
                  },
                  {
                    title: 'Quick Order',
                    subtitle: 'Create order quickly',
                    icon: '🍽️',
                    bg: 'bg-purple-100',
                    color: 'text-purple-600',
                    onClick: () => navigate('/admin/quick-orders'),
                  },
                ].map(action => (
                  <button
                    key={action.title}
                    className="rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                    onClick={action.onClick}
                  >
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
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.length === 0 && <div className="text-gray-500">No orders</div>}
                  {recentOrdersFormatted.map(order => {
                    const items = order.orderItems?.items || [];
                    const dishNames = items
                      .map((item: any) => {
                        // Sử dụng item.name trực tiếp nếu có, nếu không thì tìm qua dishId
                        if (item.name) {
                          return item.name;
                        }
                        return getDishName(item.dishId || item.id);
                      })
                      .join(', ');
                    return (
                      <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order #{order.order_number || order.orderNumber || '-'}</p>
                          <p className="text-xs text-gray-500">{dishNames}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{order.formattedAmount}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusColor(order.status)}`}>
                            {statusMap[order.status] || order.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <Outlet />
        )}
        <Routes>
          <Route path="/admin/settings" element={<SettingAdminPage />} />
        </Routes>
      </div>
    </div>
  );
}
