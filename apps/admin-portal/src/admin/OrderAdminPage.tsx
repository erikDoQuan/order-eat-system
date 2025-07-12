import React, { useEffect, useState, useContext, useRef } from 'react';
import { User as UserIcon, Edit, Trash2, LogOut } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import '../css/OrderAdminPage.css';
import axios from 'axios';
import { getAllUsers, User } from '../services/user.api';
import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import { updateOrder, deleteOrder } from '../services/order.api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchOrders = () => {
    setLoading(true);
    Promise.all([
      axios.get('/api/v1/orders'),
      getAllUsers(1, 1000),
      getAllDishes()
    ])
      .then(([ordersRes, usersRes, dishesRes]) => {
        const ordersArr = Array.isArray(ordersRes.data?.data?.data) ? ordersRes.data.data.data : [];
        setOrders(ordersArr);
        // Sắp xếp: active lên trên, sau đó theo createdAt mới nhất
        const sortedUsers = [...(usersRes.users || [])].sort((a, b) => {
          if ((b.isActive ? 1 : 0) !== (a.isActive ? 1 : 0)) {
            return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setUsers(sortedUsers);
        setDishes(dishesRes);
      })
      .catch(() => setError('Không thể tải danh sách đơn hàng hoặc dữ liệu liên quan'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
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

  const getUserName = (userId: string) => {
    if (!userId) return 'Không rõ';
    const user = users.find(u => u.id === userId);
    if (user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (name) return name;
      if (user.email) return user.email;
      return user.id;
    }
    return userId;
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

  const formatDeliveryAddress = (deliveryAddress: any) => {
    if (!deliveryAddress) return '';
    if (typeof deliveryAddress === 'string') return deliveryAddress;
    if (typeof deliveryAddress === 'object') {
      // Ưu tiên address, storeName, name, phone
      let str = deliveryAddress.address || '';
      if (deliveryAddress.storeName) str += ` (${deliveryAddress.storeName})`;
      if (deliveryAddress.name) str += ` - ${deliveryAddress.name}`;
      if (deliveryAddress.phone) str += ` - ${deliveryAddress.phone}`;
      return str.trim();
    }
    return '';
  };

  // Filter theo tên người dùng nếu cần tìm kiếm
  const filteredOrders = orders
    .filter(order => {
      const name = getUserName(order.userId) || '';
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => (b.order_number || 0) - (a.order_number || 0));

  // Thêm mapping cho status
  const statusLabel: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    delivering: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

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
    // Nếu là delivery và chưa có phone, tự động lấy số điện thoại user
    let newOrder = { ...order };
    if (order.type === 'delivery') {
      const user = users.find(u => u.id === order.userId);
      if (user) {
        let deliveryAddress = typeof order.deliveryAddress === 'object' ? { ...order.deliveryAddress } : { address: order.deliveryAddress };
        if (!deliveryAddress.phone) {
          deliveryAddress.phone = user.phoneNumber || '';
        }
        newOrder.deliveryAddress = deliveryAddress;
      }
    }
    setEditingOrder(newOrder);
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
        deliveryAddress: editingOrder.type === 'delivery'
          ? {
              address: typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.address : editingOrder.deliveryAddress,
              phone: typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.phone : ''
            }
          : editingOrder.deliveryAddress,
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#C92A15]">Order Management</h1>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-user">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">Order ID</th>
                  <th className="py-2 px-3 border-b">Order Date</th>
                  <th className="py-2 px-3 border-b">Customer</th>
                  <th className="py-2 px-3 border-b">Items</th>
                  <th className="py-2 px-3 border-b">Quantity</th>
                  <th className="py-2 px-3 border-b">Total</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Type</th>
                  <th className="py-2 px-3 border-b">Pickup Time</th>
                  <th className="py-2 px-3 border-b">Address</th>
                  <th className="py-2 px-3 border-b">Note</th>
                  <th className="py-2 px-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const items = order.orderItems?.items || [];
                  const maxItems = Math.max(1, items.length);
                  return items.length === 0 ? (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="py-2 px-3 border-b font-medium">{order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}</td>
                      <td className="py-2 px-3 border-b">{formatDate(order.createdAt)}</td>
                      <td className="py-2 px-3 border-b">{getUserName(order.userId)}</td>
                      <td className="py-2 px-3 border-b"></td>
                      <td className="py-2 px-3 border-b"></td>
                      <td className="py-2 px-3 border-b">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                      <td className="py-2 px-3 border-b">{order.status}</td>
                      <td className="py-2 px-3 border-b">{order.type}</td>
                      <td className="py-2 px-3 border-b">{order.pickupTime || ''}</td>
                      <td className="py-2 px-3 border-b">{formatDeliveryAddress(order.deliveryAddress)}</td>
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
                            <td className="py-2 px-3 border-b font-medium" rowSpan={maxItems}>{order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{formatDate(order.createdAt)}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{getUserName(order.userId)}</td>
                          </>
                        )}
                        <td className="py-2 px-3 border-b">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {item.dishSnapshot?.image && (
                              <img
                                src={item.dishSnapshot.image}
                                alt={item.dishSnapshot.name}
                                style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                              />
                            )}
                            <div>
                              <div className="font-medium">{item.dishSnapshot?.name || getDishName(item.dishId)}</div>
                              {item.dishSnapshot?.description && (
                                <div className="text-xs text-gray-500">{item.dishSnapshot.description}</div>
                              )}
                              {item.dishSnapshot?.price !== undefined && (
                                <div className="text-xs text-gray-700">{item.dishSnapshot.price.toLocaleString('vi-VN')}đ</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b">{item.quantity}</td>
                        {i === 0 && (
                          <>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{statusLabel[order.status] || order.status}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.type}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{order.pickupTime || ''}</td>
                            <td className="py-2 px-3 border-b" rowSpan={maxItems}>{formatDeliveryAddress(order.deliveryAddress)}</td>
                          </>
                        )}
                        {/* Ghi chú của từng món */}
                        <td className="py-2 px-3 border-b">{item.note || ''}</td>
                        {i === 0 && (
                          <td className="py-2 px-3 border-b" rowSpan={maxItems}>
                            <button className="mr-2 text-blue-600 hover:underline" onClick={() => handleEdit(order)}><Edit size={16} /></button>
                            <button className="text-red-600 hover:underline" onClick={() => handleDelete(order.id)} disabled={saving}><Trash2 size={16} /></button>
                          </td>
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
              <h2 className="text-lg font-bold mb-4">Edit Order</h2>
              <div className="mb-3">
                <label className="block text-sm font-medium">Status</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.status}
                  onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="delivering">Delivering</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Type</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.type}
                  onChange={e => setEditingOrder({ ...editingOrder, type: e.target.value })}
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Address</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.address || '' : editingOrder.deliveryAddress || ''}
                  onChange={e => setEditingOrder({
                    ...editingOrder,
                    deliveryAddress: {
                      ...(typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress : {}),
                      address: e.target.value
                    }
                  })}
                />
                {editingOrder.type === 'delivery' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium">Recipient Phone</label>
                    <input
                      className="w-full border rounded px-2 py-1"
                      value={typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.phone || '' : ''}
                      onChange={e => setEditingOrder({
                        ...editingOrder,
                        deliveryAddress: {
                          ...(typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress : {}),
                          phone: e.target.value
                        }
                      })}
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Note</label>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={editingOrder.note || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, note: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Total</label>
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
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowEdit(false)} disabled={saving}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>Save</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 