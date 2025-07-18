// src/admin/AdminPage.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { getAllDishes } from '../services/dish.api';
import { getAllUsers } from '../services/user.api';
import { getAllOrders } from '../services/order.api';

import '../css/AdminSidebar.css';

export default function AdminPage() {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  /* -------------------- dropdown state & helpers -------------------- */
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [dishCount, setDishCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [todayOrderCount, setTodayOrderCount] = useState<number>(0);
  const [todayRevenue, setTodayRevenue] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentDishes, setRecentDishes] = useState<any[]>([]);

  useEffect(() => {
    getAllDishes().then(dishes => setDishCount(dishes.length));
    getAllUsers(1, 1000).then(res => {
      console.log('All users:', res.users); // Kiểm tra dữ liệu thực tế trả về
      // Lọc user có role là 'user' và isActive hoặc is_active là true
      const filteredUsers = res.users.filter(
        u =>
          (u.role === 'user' || u.role === 'USER') &&
          u.isActive === true
      );
      setUserCount(filteredUsers.length);
    });
    getAllOrders().then(orders => {
      const today = new Date();
      const isToday = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      };
      const todayOrders = orders.filter((o: any) => o.createdAt && isToday(o.createdAt));
      setTodayOrderCount(todayOrders.length);
      setTodayRevenue(todayOrders.reduce((sum: number, o: any) => sum + (isToday(o.createdAt) ? (parseFloat(o.totalAmount) || 0) : 0), 0));
      // Sắp xếp và lấy 3 đơn hàng gần nhất
      const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentOrders(sorted.slice(0, 3));
    });
    getAllDishes().then(setRecentDishes);
  }, []);

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
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'delivering': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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


        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Dishes', value: dishCount, bg: 'bg-blue-500', icon: '🍕' },
            { label: "Today's Orders", value: todayOrderCount, bg: 'bg-green-500', icon: '📦' },
            { label: "Today's Revenue", value: todayRevenue.toLocaleString('vi-VN') + '₫', bg: 'bg-yellow-500', icon: '💰' },
            { label: 'New Users', value: userCount, bg: 'bg-purple-500', icon: '👥' },
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
                title: 'Settings',
                subtitle: 'System configuration',
                icon: '⚙️',
                bg: 'bg-purple-100',
                color: 'text-purple-600',
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
              {recentOrders.map(order => {
                const items = (order.orderItems?.items || []);
                const dishNames = items.map((item: any) => getDishName(item.dishId)).join(', ');
                return (
                  <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.order_number || order.orderNumber || '-'}</p>
                      <p className="text-xs text-gray-500">{dishNames}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{Number(order.totalAmount).toLocaleString('vi-VN')}₫</p>
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
      </div>
    </div>
  );
}
