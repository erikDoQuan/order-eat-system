import React, { useEffect, useState } from 'react';
import { User as UserIcon, Edit, Trash2 } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import '../css/OrderAdminPage.css';
import axios from 'axios';
import { getAllUsers, User } from '../services/user.api';
import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import { updateOrder, deleteOrder } from '../services/order.api';

export default function OrderAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/v1/orders'),
      getAllUsers(),
      getAllDishes()
    ])
      .then(([ordersRes, usersRes, dishesRes]) => {
        const ordersArr = Array.isArray(ordersRes.data?.data?.data) ? ordersRes.data.data.data : [];
        setOrders(ordersArr);
        setUsers(usersRes);
        setDishes(dishesRes);
      })
      .catch(() => setError('Không thể tải danh sách đơn hàng hoặc dữ liệu liên quan'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : userId;
  };

  const getDishName = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : dishId;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
  };

  // Filter theo tên người dùng nếu cần tìm kiếm
  const filteredOrders = orders
    .filter(order => getUserName(order.userId).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.order_number || 0) - (a.order_number || 0));

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;
    setSaving(true);
    try {
      await deleteOrder(id);
      fetchOrders();
    } catch {
      alert('Xóa thất bại');
    }
    setSaving(false);
  };

  const handleEdit = (order: any) => {
    setEditingOrder(order);
    setShowEdit(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Chỉ gửi các trường hợp lệ
      const payload: any = {
        status: editingOrder.status,
        type: editingOrder.type,
        deliveryAddress: editingOrder.deliveryAddress,
        isActive: editingOrder.isActive,
      };
      if (editingOrder.orderItems) payload.orderItems = editingOrder.orderItems;
      if (
        editingOrder.totalAmount !== undefined &&
        editingOrder.totalAmount !== '' &&
        typeof editingOrder.totalAmount === 'number' &&
        !isNaN(editingOrder.totalAmount)
      ) {
        payload.totalAmount = editingOrder.totalAmount;
      }
      const res = await updateOrder(editingOrder.id, payload);
      if (res?.statusCode && res.statusCode === 200) {
        setShowEdit(false);
        fetchOrders();
      } else {
        let msg = '';
        if (Array.isArray(res.message)) msg = res.message.map((m: any) => typeof m === 'object' ? JSON.stringify(m) : m).join(', ');
        else if (typeof res.message === 'object') msg = JSON.stringify(res.message);
        else msg = res.message || 'Lỗi không xác định';
        alert('Cập nhật thất bại: ' + msg);
      }
    } catch (err: any) {
      let msg = '';
      if (err?.response?.data) {
        if (Array.isArray(err.response.data.message)) {
          msg = err.response.data.message.map((m: any) => typeof m === 'object' ? JSON.stringify(m) : m).join(', ');
        } else if (typeof err.response.data.message === 'object') {
          msg = JSON.stringify(err.response.data.message);
        } else {
          msg = err.response.data.message || err.message;
        }
      } else {
        msg = err?.message || 'Lỗi không xác định';
      }
      alert('Cập nhật thất bại: ' + msg);
    }
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="relative mb-8 flex items-center justify-end gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]">
            <UserIcon size={20} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#C92A15]">Quản lý đơn hàng</h1>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người đặt..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-user">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  {/* <th className="py-2 px-3 border-b">STT</th> */}
                  <th className="py-2 px-3 border-b">Mã đơn</th>
                  <th className="py-2 px-3 border-b">Ngày đặt</th>
                  <th className="py-2 px-3 border-b">Người đặt</th>
                  <th className="py-2 px-3 border-b">Chi tiết món</th>
                  <th className="py-2 px-3 border-b">Số lượng</th>
                  <th className="py-2 px-3 border-b">Tổng tiền</th>
                  <th className="py-2 px-3 border-b">Trạng thái</th>
                  <th className="py-2 px-3 border-b">Loại</th>
                  <th className="py-2 px-3 border-b">Pickup Time</th>
                  <th className="py-2 px-3 border-b">Địa chỉ</th>
                  <th className="py-2 px-3 border-b">Ghi chú</th>
                  <th className="py-2 px-3 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const items = order.orderItems?.items || [];
                  const maxItems = Math.max(1, items.length);
                  return items.length === 0 ? (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      {/* <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td> */}
                      <td className="py-2 px-3 border-b font-medium">{order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}</td>
                      <td className="py-2 px-3 border-b">{formatDate(order.createdAt)}</td>
                      <td className="py-2 px-3 border-b">{getUserName(order.userId)}</td>
                      <td className="py-2 px-3 border-b"></td>
                      <td className="py-2 px-3 border-b"></td>
                      <td className="py-2 px-3 border-b">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                      <td className="py-2 px-3 border-b">{order.status}</td>
                      <td className="py-2 px-3 border-b">{order.type}</td>
                      <td className="py-2 px-3 border-b">{order.pickupTime || ''}</td>
                      <td className="py-2 px-3 border-b">{order.deliveryAddress}</td>
                      <td className="py-2 px-3 border-b">{order.note}</td>
                      <td className="py-2 px-3 border-b">
                        <button className="mr-2 text-blue-600 hover:underline" onClick={() => handleEdit(order)}><Edit size={16} /></button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(order.id)} disabled={saving}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ) : (
                    items.map((item: any, i: number) => (
                      <tr key={order.id + '-' + i} className="hover:bg-gray-50 transition">
                        {i === 0 && (
                          <>
                            {/* <td className="py-2 px-3 border-b text-xs text-gray-500" rowSpan={maxItems}>{idx + 1}</td> */}
                            <td className="py-2 px-3 border-b font-medium" rowSpan={maxItems}>{order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{formatDate(order.createdAt)}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{getUserName(order.userId)}</td>
                          </>
                        )}
                        <td className="py-2 px-3 border-b">{getDishName(item.dishId)}</td>
                        <td className="py-2 px-3 border-b">{item.quantity}</td>
                        {i === 0 && (
                          <>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.status}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.type}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.pickupTime || ''}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.deliveryAddress}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.note}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>
                              <button className="mr-2 text-blue-600 hover:underline" onClick={() => handleEdit(order)}><Edit size={16} /></button>
                              <button className="text-red-600 hover:underline" onClick={() => handleDelete(order.id)} disabled={saving}><Trash2 size={16} /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {showEdit && editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <form className="bg-white p-6 rounded shadow-md min-w-[320px]" onSubmit={handleEditSubmit}>
              <h2 className="text-lg font-bold mb-4">Chỉnh sửa đơn hàng</h2>
              <div className="mb-3">
                <label className="block text-sm font-medium">Trạng thái</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.status}
                  onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="preparing">Đang chuẩn bị</option>
                  <option value="delivering">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Loại</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.type}
                  onChange={e => setEditingOrder({ ...editingOrder, type: e.target.value })}
                >
                  <option value="pickup">Nhận tại quán</option>
                  <option value="delivery">Giao tận nơi</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Địa chỉ</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.deliveryAddress || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, deliveryAddress: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Ghi chú</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.note || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, note: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Tổng tiền</label>
                <input
                  type="number"
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.totalAmount ?? ''}
                  onChange={e => setEditingOrder({ ...editingOrder, totalAmount: e.target.value ? Number(e.target.value) : '' })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowEdit(false)} disabled={saving}>Hủy</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>Lưu</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 