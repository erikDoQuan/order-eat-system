import React, { useEffect, useState, useContext, useRef } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { getAllUserTransactions } from '../services/user-transaction.api';
import { AuthContext } from '../context/AuthContext';

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
  };

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

  // Filter/search thực sự hoạt động
  const filteredTransactions = transactions
    .filter(tran => {
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
        <div className="flex items-center justify-between mb-6">
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
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">STT</th>
                  <th className="py-2 px-3 border-b">User</th>
                  <th className="py-2 px-3 border-b">Order</th>
                  <th className="py-2 px-3 border-b">Amount</th>
                  <th className="py-2 px-3 border-b">Method</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Transaction Time</th>
                  <th className="py-2 px-3 border-b">Transaction Code</th>
                  <th className="py-2 px-3 border-b">Description</th>
                  <th className="py-2 px-3 border-b">Created At</th>
                  <th className="py-2 px-3 border-b">Updated At</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={11} className="p-4 text-gray-500 text-center">Không có giao dịch nào.</td>
                  </tr>
                )}
                {filteredTransactions.map((tran, idx) => (
                  <tr key={tran.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 border-b font-medium">{getUserName(tran.userId)}</td>
                    <td className="py-2 px-3 border-b">{getOrderLabel(tran.orderId)}</td>
                    <td className="py-2 px-3 border-b text-right">{Number(tran.amount).toLocaleString('vi-VN')}₫</td>
                    <td className="py-2 px-3 border-b">{tran.method}</td>
                    <td className="py-2 px-3 border-b">
                      <span className={`inline-block whitespace-nowrap px-2 py-1 rounded text-xs font-semibold ${
                        (tran.statusText === 'Hoàn thành')
                          ? 'bg-green-100 text-green-800'
                          : (STATUS_LABEL[tran.status]?.color || 'bg-gray-100 text-gray-800')
                      }`}>
                        {tran.statusText || STATUS_LABEL[tran.status]?.label || tran.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-b">{formatDate(tran.transTime)}</td>
                    <td className="py-2 px-3 border-b">{tran.transactionCode || '-'}</td>
                    <td className="py-2 px-3 border-b">{tran.description}</td>
                    <td className="py-2 px-3 border-b">{formatDate(tran.createdAt)}</td>
                    <td className="py-2 px-3 border-b">{formatDate(tran.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* PHÂN TRANG ĐƠN GIẢN */}
            <div className="flex gap-2 mt-4 items-center justify-center">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trang trước
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 