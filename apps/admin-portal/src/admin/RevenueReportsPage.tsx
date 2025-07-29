import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import AdminSidebar from '../components/AdminSidebar';

import './RevenueReportsPage.css';

import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';

function getTodayISO() {
  const today = new Date();
  return today.toISOString().slice(0, 10);
}
function get7DaysAgoISO() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}
function getFirstDayOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

// Custom Tooltip cho BarChart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #eee', padding: 10, borderRadius: 6 }}>
        <div>
          <b>{label}</b>
        </div>
        <div>
          Revenue: {payload[0].value.toLocaleString('vi-VN')} <span style={{ fontSize: 13 }}>vnđ</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueReportsPage() {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [from, setFrom] = useState(getTodayISO());
  const [to, setTo] = useState(getTodayISO());
  const [pendingFrom, setPendingFrom] = useState(getTodayISO());
  const [pendingTo, setPendingTo] = useState(getTodayISO());
  const [pageLoading, setPageLoading] = useState(false);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrder: 0,
    chartData: [],
    orders: [],
  });
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Thêm state phân trang cho bảng Order List:
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const orders = data.orders || [];
  const totalPages = Math.ceil(orders.length / pageSize);
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  useEffect(() => {
    setPageLoading(true);
    axios
      .get('/api/v1/reports/revenue', { params: { from, to } })
      .then(res => setData(res.data))
      .finally(() => setPageLoading(false));
  }, [from, to]);

  useEffect(() => {
    axios.get('/api/v1/user-transaction').then(res => {
      setTransactions(res.data?.data || []);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [from, to]);

  const barColors = [
    '#C92A15',
    '#F59E42',
    '#2D9CDB',
    '#27AE60',
    '#9B51E0',
    '#F2C94C',
    '#EB5757',
    '#6FCF97',
    '#56CCF2',
    '#BB6BD9',
    '#F2994A',
    '#219653',
    '#2F80ED',
    '#BDBDBD',
    '#FF6F61',
    '#6B5B95',
    '#88B04B',
    '#F7CAC9',
    '#92A8D1',
    '#955251',
    '#B565A7',
    '#009B77',
    '#DD4124',
    '#D65076',
    '#45B8AC',
    '#EFC050',
    '#5B5EA6',
    '#9B2335',
    '#DFCFBE',
    '#55B4B0',
  ];

  // Preset filter handlers
  const handleToday = () => {
    const today = getTodayISO();
    setFrom(today);
    setTo(today);
  };
  const handle7Days = () => {
    setFrom(get7DaysAgoISO());
    setTo(getTodayISO());
  };
  const handleThisMonth = () => {
    setFrom(getFirstDayOfMonthISO());
    setTo(getTodayISO());
  };

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
        {/* User info and dropdown */}
        <div className="relative mb-8 flex items-center justify-end gap-3">
          <div
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]"
            onClick={() => setShowMenu(v => !v)}
            ref={menuRef}
          >
            <UserIcon size={20} />
            {user && showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/admin/profile');
                  }}
                >
                  <UserIcon size={18} className="text-gray-500" />
                  Tài khoản
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    setUser(null);
                    navigate('/login', { replace: true });
                  }}
                >
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
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#C92A15]">Revenue Reports</h1>
          <div className="flex flex-col items-start gap-2 md:flex-row md:items-center">
            <div className="flex gap-2">
              <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="rounded border px-2 py-1" />
              <span>-</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)} className="rounded border px-2 py-1" />
            </div>
            <div className="mt-2 flex gap-2 md:mt-0">
              <button onClick={handleToday} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">
                Hôm nay
              </button>
              <button onClick={handle7Days} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">
                7 ngày qua
              </button>
              <button onClick={handleThisMonth} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">
                Tháng này
              </button>
            </div>
          </div>
        </div>
        {pageLoading ? (
          <div className="py-12 text-center text-lg">Loading...</div>
        ) : (
          <>
            {/* Cards tổng quan */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center rounded bg-white p-6 shadow">
                <div className="mb-2 text-lg font-semibold text-gray-600">Total Revenue</div>
                <div className="text-2xl font-bold text-[#C92A15]">{data.totalRevenue.toLocaleString('vi-VN')}₫</div>
              </div>
              <div className="flex flex-col items-center rounded bg-white p-6 shadow">
                <div className="mb-2 text-lg font-semibold text-gray-600">Total Orders</div>
                <div className="text-2xl font-bold text-[#C92A15]">{data.totalOrders}</div>
              </div>
              <div className="flex flex-col items-center rounded bg-white p-6 shadow">
                <div className="mb-2 text-lg font-semibold text-gray-600">Average Order Value</div>
                <div className="text-2xl font-bold text-[#C92A15]">{data.avgOrder.toLocaleString('vi-VN')}₫</div>
              </div>
            </div>
            {/* Biểu đồ doanh thu */}
            <div className="mb-8 rounded bg-white p-6 shadow">
              <div className="mb-4 font-semibold">Revenue by Day</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue">
                    {data.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Bảng đơn hàng */}
            <div className="order-table-container">
              <div className="mb-4 font-semibold">Order List</div>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order: any, idx: number) => {
                    // Lấy paymentMethod từ user transaction nếu có, so sánh id về string
                    const txs = transactions.filter((t: any) => String(t.orderId) === String(order.id));
                    const tx = txs.find((t: any) => t.status === 'success' || t.status === 'pending');
                    let paymentMethod = '-';
                    if (tx && tx.method) paymentMethod = String(tx.method).toLowerCase();
                    else if (order.paymentMethod) paymentMethod = order.paymentMethod;
                    else paymentMethod = 'cash';
                    return (
                      <tr key={order.id}>
                        <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td>{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                        <td>{order.customer}</td>
                        <td>
                          {order.total.toLocaleString('vi-VN')}
                          <span style={{ marginLeft: 2 }}>₫</span>
                        </td>
                        <td>{paymentMethod}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {(() => {
                  const pages: React.ReactNode[] = [];

                  // Luôn hiển thị trang đầu
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className={`rounded border px-3 py-1 ${1 === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      1
                    </button>,
                  );

                  // Hiển thị trang hiện tại và 2 trang xung quanh
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);

                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2">
                        ...
                      </span>,
                    );
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`rounded border px-3 py-1 ${i === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2">
                        ...
                      </span>,
                    );
                  }

                  // Luôn hiển thị trang cuối
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`rounded border px-3 py-1 ${totalPages === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {totalPages}
                      </button>,
                    );
                  }

                  return pages;
                })()}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
