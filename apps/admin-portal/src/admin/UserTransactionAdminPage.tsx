import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { getAllUserTransactions } from '../services/user-transaction.api';

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
  success: { label: 'Thành công', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Đã huỷ', color: 'bg-gray-100 text-gray-800' },
};

export default function UserTransactionAdminPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const { user } = useContext(AuthContext);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  // Thêm state phân trang:
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const getUserName = (userId: string) => {
    if (!userId) return 'Không rõ';
    const user = users.find((u: any) => u.id === userId);
    if (user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (name) return name;
      if (user.email) return user.email;
      return user.id;
    }
    return userId;
  };
  const getOrderLabel = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId);
    return order ? `#${order.orderNumber || order.id}` : orderId;
  };
  const filteredTransactions = transactions
    .filter(tran => tran.method === 'zalopay')
    .filter(tran => {
      // Nếu search là orderId (UUID), so sánh trực tiếp tran.orderId === search
      if (search && search.length >= 20 && /^[a-zA-Z0-9-]+$/.test(search)) {
        return tran.orderId === search;
      }
      const userName = (getUserName(tran.userId) || '').toLowerCase();
      const orderLabel = (getOrderLabel(tran.orderId) || '').toLowerCase();
      const desc = (tran.description || '').toLowerCase();
      const code = (tran.transactionCode || '').toLowerCase();
      return (
        userName.includes(search.toLowerCase()) ||
        orderLabel.includes(search.toLowerCase()) ||
        desc.includes(search.toLowerCase()) ||
        code.includes(search.toLowerCase())
      );
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Khi mount, nếu có orderId trên query param, setSearch
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      // Tìm orderNumber nếu có
      const order = orders.find((o: any) => o.id === orderId);
      if (order && order.orderNumber) {
        setSearch(`#${order.orderNumber}`);
      } else {
        setSearch(orderId);
      }
      setTimeout(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
      }, 100);
    }
    // eslint-disable-next-line
  }, [location.search, orders]);

  const fetchTransactions = () => {
    setLoading(true);
    getAllUserTransactions()
      .then(res => {
        setTransactions(res.data || []);
        setUsers(res.users || []);
        setOrders(res.orders || []);
        setTotal(res.total || 0);
        setLimit(res.limit || 20);
      })
      .catch(() => setError('Không thể tải danh sách giao dịch'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, [page, limit]);

  // Reset currentPage về 1 khi search thay đổi:
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
  };

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#C92A15]">User Transaction Management</h1>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Tìm kiếm theo user, order, mô tả, mã giao dịch..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 bg-white">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border-b px-3 py-2">STT</th>
                  <th className="border-b px-3 py-2">User</th>
                  <th className="border-b px-3 py-2">Order</th>
                  <th className="border-b px-3 py-2">Amount</th>
                  <th className="border-b px-3 py-2">Method</th>
                  <th className="border-b px-3 py-2">Status</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Transaction Time</th>
                  <th className="border-b px-3 py-2">Transaction Code</th>
                  <th className="border-b px-3 py-2">Description</th>
                  <th className="border-b px-3 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-4 text-center text-gray-500">
                      Không có giao dịch nào.
                    </td>
                  </tr>
                )}
                {paginatedTransactions.map((tran, idx) => (
                  <tr key={tran.id} className="transition hover:bg-gray-50">
                    <td className="border-b px-3 py-2 text-xs text-gray-500">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="border-b px-3 py-2 font-medium">{getUserName(tran.userId)}</td>
                    <td className="border-b px-3 py-2">{getOrderLabel(tran.orderId)}</td>
                    <td className="border-b px-3 py-2 text-right">{Number(tran.amount).toLocaleString('vi-VN')}₫</td>
                    <td className="border-b px-3 py-2">{tran.method}</td>
                    <td className="border-b px-3 py-2">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${
                          tran.statusText === 'Hoàn thành'
                            ? 'bg-green-100 text-green-800'
                            : STATUS_LABEL[tran.status]?.color || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {tran.statusText || STATUS_LABEL[tran.status]?.label || tran.status}
                      </span>
                    </td>
                    <td className="border-b px-3 py-2">{formatDate(tran.transTime)}</td>
                    <td className="border-b px-3 py-2">{tran.transactionCode || tran.order?.appTransId || '-'}</td>
                    <td className="border-b px-3 py-2">{tran.description}</td>
                    <td className="border-b px-3 py-2">{formatDate(tran.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* PHÂN TRANG ĐƠN GIẢN */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`rounded border px-3 py-1 ${page === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
