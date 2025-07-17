import React, { useEffect, useState, useContext } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { getAllUserTransactions } from '../services/user-transaction.api';
import { AuthContext } from '../context/AuthContext';

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
  const { user } = useContext(AuthContext); // Không destructuring logout

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

  const statusLabel: Record<string, string> = {
    pending: 'Chờ xử lý',
    success: 'Thành công',
    failed: 'Thất bại',
    cancelled: 'Đã hủy',
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

  // Không filter, luôn hiển thị toàn bộ transactions
  const filteredTransactions = transactions;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Quản lý giao dịch người dùng</h1>
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Tìm kiếm theo user, order, mô tả..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 w-80"
          />
        </div>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 border">ID</th>
                  <th className="px-3 py-2 border">User</th>
                  <th className="px-3 py-2 border">User ID</th>
                  <th className="px-3 py-2 border">Order</th>
                  <th className="px-3 py-2 border">Order ID</th>
                  <th className="px-3 py-2 border">Số tiền</th>
                  <th className="px-3 py-2 border">Phương thức</th>
                  <th className="px-3 py-2 border">Trạng thái</th>
                  <th className="px-3 py-2 border">Thời gian giao dịch</th>
                  <th className="px-3 py-2 border">Mã giao dịch</th>
                  <th className="px-3 py-2 border">Mô tả</th>
                  <th className="px-3 py-2 border">createdAt</th>
                  <th className="px-3 py-2 border">updatedAt</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tran => (
                  <tr key={tran.id} className="hover:bg-gray-100">
                    <td className="px-3 py-2 border">{tran.id}</td>
                    <td className="px-3 py-2 border">{getUserName(tran.userId)}</td>
                    <td className="px-3 py-2 border">{tran.userId}</td>
                    <td className="px-3 py-2 border">{getOrderLabel(tran.orderId)}</td>
                    <td className="px-3 py-2 border">{tran.orderId}</td>
                    <td className="px-3 py-2 border text-right">{Number(tran.amount).toLocaleString('vi-VN')}₫</td>
                    <td className="px-3 py-2 border">{tran.method}</td>
                    <td className="px-3 py-2 border font-semibold">{statusLabel[tran.status] || tran.status}</td>
                    <td className="px-3 py-2 border">{formatDate(tran.transTime)}</td>
                    <td className="px-3 py-2 border">{tran.transactionCode || '-'}</td>
                    <td className="px-3 py-2 border">{tran.description}</td>
                    <td className="px-3 py-2 border">{formatDate(tran.createdAt)}</td>
                    <td className="px-3 py-2 border">{formatDate(tran.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && <div className="p-4 text-gray-500">Không có giao dịch nào.</div>}
            <div className="flex gap-2 mt-4 items-center">
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