import React, { useContext, useEffect, useRef, useState } from 'react';
import { Edit, LogOut, Printer, Trash2, User as UserIcon } from 'lucide-react';

import AdminSidebar from '../components/AdminSidebar';

import '../css/OrderAdminPage.css';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import BillPreviewModal from '../components/BillPreviewModal';
import RatingStars from '../components/RatingStars';
import { AuthContext } from '../context/AuthContext';
import { getAllDishes } from '../services/dish.api';
import { deleteOrder, updateOrder } from '../services/order.api';
import { getAllUsers, User } from '../services/user.api';
import { Dish } from '../types/dish.type';

function ReviewForm({ dishId, existingReview, onSubmit }) {
  const [rating, setRating] = React.useState(existingReview?.rating || 5);
  const [comment, setComment] = React.useState(existingReview?.comment || '');
  const [submitting, setSubmitting] = React.useState(false);
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ dishId, rating, comment });
    setSubmitting(false);
  };
  return (
    <form onSubmit={handleSubmit} className="mt-2 flex max-w-md flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700">Đánh giá:</span>
        <RatingStars value={rating} onChange={setRating} size={28} readOnly={!!existingReview} />
      </div>
      <textarea
        className="w-full rounded border p-2"
        placeholder="Nhận xét của bạn..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        disabled={!!existingReview}
      />
      {!existingReview && (
        <button type="submit" className="rounded bg-[#C92A15] px-4 py-2 text-white transition hover:bg-[#a81f0e]" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      )}
      {existingReview && <div className="font-medium text-green-600">Bạn đã đánh giá món này.</div>}
    </form>
  );
}

export default function OrderAdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [billUrl, setBillUrl] = useState<string | null>(null);
  // Thêm state cho modal chi tiết
  const [showDetail, setShowDetail] = useState(false);
  const [detailOrder, setDetailOrder] = useState<any>(null);
  // Thêm state để lưu transactions
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  const fetchOrders = () => {
    setPageLoading(true);
    Promise.all([axios.get('/api/v1/orders'), getAllUsers(1, 1000), getAllDishes(), axios.get('/api/v1/user-transaction')])
      .then(([ordersRes, usersRes, dishesRes, transactionsRes]) => {
        const ordersArr = Array.isArray(ordersRes.data?.data?.data) ? ordersRes.data.data.data : [];
        setOrders(ordersArr);
        setTransactions(transactionsRes.data?.data || []);
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
      .finally(() => setPageLoading(false));
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

  const getDishNameById = dishId => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : '';
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

  const printBill = (order: any) => {
    // Lấy paymentMethod từ user transaction nếu có
    let paymentMethod = order.paymentMethod || '';
    const txs = transactions.filter((t: any) => t.orderId === order.id);
    const tx = txs.find((t: any) => t.status === 'success' || t.status === 'pending');
    if (tx && tx.method) paymentMethod = String(tx.method).toLowerCase();
    console.log('order.id:', order.id, 'paymentMethod:', paymentMethod, 'tx:', tx, 'allTx:', txs);
    const items = (order.orderItems?.items || []).map(item => {
      // Ưu tiên lấy base_price từ dish theo dishId
      const dish = dishes.find(d => d.id === item.dishId);
      const price = Number(dish?.basePrice) || Number(item.dishSnapshot?.price) || Number(item.dish?.price) || Number(item.price) || 0;
      return {
        name: getDishNameById(item.dishId) || item.dishSnapshot?.name || item.dish?.name || item.name || 'Không rõ tên món',
        quantity: item.quantity,
        price,
        total: price * (Number(item.quantity) || 0),
      };
    });
    // Nếu là đơn giao hàng, thêm phí ship
    if (order.type === 'delivery') {
      items.push({ name: 'Phí ship', quantity: '', price: 25000, total: 25000 });
    }
    const total = order.totalAmount || 0;
    const customerName = getUserName(order.userId);
    const customerAddress = order.deliveryAddress?.address || '';
    const customerPhone = order.deliveryAddress?.phone || order.customerPhone || users.find(u => u.id === order.userId)?.phoneNumber || '';
    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '';
    // Lấy thông tin admin hoàn thành đơn
    let adminName = '';
    let adminEmail = '';
    if (order.updatedBy) {
      const admin = users.find(u => u.id === order.updatedBy);
      if (admin) {
        adminName = `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.email || admin.id;
        adminEmail = admin.email || '';
      }
    }
    const adminId = order.updatedBy || '';
    const url = `/bill/preview?id=${order.id}&customer=${encodeURIComponent(customerName)}&items=${encodeURIComponent(JSON.stringify(items))}&total=${total}&customerAddress=${encodeURIComponent(customerAddress)}&customerPhone=${encodeURIComponent(customerPhone)}&date=${encodeURIComponent(date)}&order_number=${order.order_number || order.orderNumber || ''}&adminId=${encodeURIComponent(adminId)}&paymentMethod=${paymentMethod}`;
    navigate(url);
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
        deliveryAddress:
          editingOrder.type === 'delivery'
            ? {
                address: typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.address : editingOrder.deliveryAddress,
                phone: typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.phone : '',
              }
            : editingOrder.deliveryAddress,
        isActive: editingOrder.isActive,
      };
      // Chỉ truyền updatedBy khi chuyển trạng thái sang completed
      if (['completed', 'hoàn thành'].includes((editingOrder.status || '').toLowerCase())) {
        payload.updatedBy = user?.id;
      }
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
        if (Array.isArray(res.message)) msg = res.message.map((m: any) => (typeof m === 'object' ? JSON.stringify(m) : m)).join(', ');
        else if (typeof res.message === 'object') msg = JSON.stringify(res.message);
        else msg = res.message || 'Lỗi không xác định';
        alert('Cập nhật thất bại: ' + msg);
      }
    } catch (err: any) {
      let msg = '';
      if (err?.response?.data) {
        if (Array.isArray(err.response.data.message)) {
          msg = err.response.data.message.map((m: any) => (typeof m === 'object' ? JSON.stringify(m) : m)).join(', ');
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
    // logout(); // This line was removed as per the edit hint.
    navigate('/login');
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
        <div className="mb-6 flex items-center justify-between">
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
        {pageLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!pageLoading && !error && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="table-admin-user" style={{ minWidth: 1200 }}>
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border-b px-3 py-2">Order ID</th>
                  <th className="border-b px-3 py-2">Order Date</th>
                  <th className="border-b px-3 py-2">Customer</th>
                  <th className="border-b px-3 py-2">Items</th>
                  <th className="border-b px-3 py-2">Quantity</th>
                  <th className="border-b px-3 py-2">Total</th>
                  <th className="border-b px-3 py-2">Status</th>
                  <th className="border-b px-3 py-2">Type</th>
                  <th className="border-b px-3 py-2">Pickup Time</th>
                  <th className="border-b px-3 py-2">Address</th>
                  <th className="border-b px-3 py-2">Note</th>
                  <th className="border-b px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => {
                  const items = order.orderItems?.items || [];
                  const maxItems = Math.max(1, items.length);
                  const isCompleted = ['completed', 'hoàn thành'].includes((order.status || '').toLowerCase());
                  // Lấy paymentMethod từ user transaction nếu có
                  const txs = transactions.filter((t: any) => t.orderId === order.id);
                  const tx = txs.find((t: any) => t.status === 'success' || t.status === 'pending');
                  let paymentMethod = order.paymentMethod || '';
                  if (tx && tx.method) paymentMethod = String(tx.method).toLowerCase();
                  return (
                    <React.Fragment key={order.id}>
                      {items.length === 0 ? (
                        <tr className="transition hover:bg-gray-50">
                          <td className="border-b px-3 py-2 font-medium">
                            {order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}
                          </td>
                          <td className="border-b px-3 py-2">{formatDate(order.createdAt)}</td>
                          <td className="border-b px-3 py-2">{getUserName(order.userId)}</td>
                          <td className="border-b px-3 py-2"></td>
                          <td className="border-b px-3 py-2"></td>
                          <td className="border-b px-3 py-2">{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                          <td className="border-b px-3 py-2">{order.status}</td>
                          <td className="border-b px-3 py-2">{order.type}</td>
                          <td className="border-b px-3 py-2">{order.pickupTime || ''}</td>
                          <td className="border-b px-3 py-2">{formatDeliveryAddress(order.deliveryAddress)}</td>
                          <td className="border-b px-3 py-2">{order.note}</td>
                          <td className="border-b px-3 py-2">
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', width: 120 }}>
                              <button
                                title="Sửa"
                                onClick={() => handleEdit(order)}
                                style={{
                                  width: 36,
                                  height: 36,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: 'none',
                                  background: 'none',
                                  color: '#2563eb',
                                  cursor: 'pointer',
                                  fontSize: 0,
                                }}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                title="Xóa"
                                onClick={() => handleDelete(order.id)}
                                disabled={saving}
                                style={{
                                  width: 36,
                                  height: 36,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: 'none',
                                  background: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: 0,
                                }}
                              >
                                <Trash2 size={18} />
                              </button>
                              {isCompleted ? (
                                <button
                                  title="In hóa đơn"
                                  onClick={() => printBill(order)}
                                  style={{
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    background: 'none',
                                    color: '#16a34a',
                                    cursor: 'pointer',
                                    fontSize: 0,
                                  }}
                                >
                                  <Printer size={18} />
                                </button>
                              ) : (
                                <span style={{ width: 36, height: 36, display: 'inline-block' }}></span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        items.map((item, i) => (
                          <tr key={order.id + '-' + i} className="transition hover:bg-gray-50">
                            {i === 0 && (
                              <>
                                <td className="border-b px-3 py-2 font-medium" rowSpan={maxItems}>
                                  {order.order_number || order.orderNumber ? `#${order.order_number || order.orderNumber}` : '-'}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {getUserName(order.userId)}
                                </td>
                              </>
                            )}
                            <td className="border-b px-3 py-2">
                              {item.dishSnapshot?.name || item.name || getDishName(item.dishId) || item.dish?.name || 'Không rõ tên món'}
                            </td>
                            <td className="border-b px-3 py-2">{item.quantity}</td>
                            {i === 0 && (
                              <>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {Number(order.totalAmount).toLocaleString('vi-VN')}đ
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {order.status}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {order.type}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {order.pickupTime || ''}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {formatDeliveryAddress(order.deliveryAddress)}
                                </td>
                                <td className="border-b px-3 py-2" rowSpan={maxItems}>
                                  {order.note}
                                </td>
                                <td className="border-b px-3 py-2">
                                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', width: 120 }}>
                                    <button
                                      title="Sửa"
                                      onClick={() => handleEdit(order)}
                                      style={{
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        background: 'none',
                                        color: '#2563eb',
                                        cursor: 'pointer',
                                        fontSize: 0,
                                      }}
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      title="Xóa"
                                      onClick={() => handleDelete(order.id)}
                                      disabled={saving}
                                      style={{
                                        width: 36,
                                        height: 36,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: 'none',
                                        background: 'none',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        fontSize: 0,
                                      }}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                    {isCompleted ? (
                                      <button
                                        title="In hóa đơn"
                                        onClick={() => printBill(order)}
                                        style={{
                                          width: 36,
                                          height: 36,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          border: 'none',
                                          background: 'none',
                                          color: '#16a34a',
                                          cursor: 'pointer',
                                          fontSize: 0,
                                        }}
                                      >
                                        <Printer size={18} />
                                      </button>
                                    ) : (
                                      <span style={{ width: 36, height: 36, display: 'inline-block' }}></span>
                                    )}
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {showEdit && editingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <form className="min-w-[320px] rounded bg-white p-6 shadow-md" onSubmit={handleEditSubmit}>
              <h2 className="mb-4 text-lg font-bold">Edit Order</h2>
              <div className="mb-3">
                <label className="block text-sm font-medium">Status</label>
                <select
                  className="w-full rounded border px-2 py-1"
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
                  className="w-full rounded border px-2 py-1"
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
                  className="w-full rounded border px-2 py-1"
                  value={
                    typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.address || '' : editingOrder.deliveryAddress || ''
                  }
                  onChange={e =>
                    setEditingOrder({
                      ...editingOrder,
                      deliveryAddress: {
                        ...(typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress : {}),
                        address: e.target.value,
                      },
                    })
                  }
                />
                {editingOrder.type === 'delivery' && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium">Recipient Phone</label>
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress.phone || '' : ''}
                      onChange={e =>
                        setEditingOrder({
                          ...editingOrder,
                          deliveryAddress: {
                            ...(typeof editingOrder.deliveryAddress === 'object' ? editingOrder.deliveryAddress : {}),
                            phone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Note</label>
                <input
                  className="w-full rounded border px-2 py-1"
                  value={editingOrder.note || ''}
                  onChange={e => setEditingOrder({ ...editingOrder, note: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium">Total</label>
                <input
                  type="number"
                  className="w-full rounded border px-2 py-1"
                  value={editingOrder.totalAmount ?? ''}
                  onChange={e => setEditingOrder({ ...editingOrder, totalAmount: e.target.value ? Number(e.target.value) : '' })}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button type="button" className="rounded bg-gray-200 px-4 py-2" onClick={() => setShowEdit(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white" disabled={saving}>
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
        {billUrl && <BillPreviewModal url={billUrl} onClose={() => setBillUrl(null)} />}
        {/* Modal chi tiết đơn hàng */}
        {showDetail && detailOrder && (
          <div className="modal-order-detail">
            <div className="modal-content">
              <h2>Chi tiết đơn #{detailOrder.order_number || detailOrder.orderNumber}</h2>
              <div>
                <b>Khách hàng:</b> {getUserName(detailOrder.userId)}
              </div>
              <div>
                <b>Địa chỉ:</b> {formatDeliveryAddress(detailOrder.deliveryAddress)}
              </div>
              <div>
                <b>Số điện thoại:</b> {detailOrder.deliveryAddress?.phone || '-'}
              </div>
              <div>
                <b>Thời gian đặt:</b> {formatDate(detailOrder.createdAt)}
              </div>
              <div>
                <b>Trạng thái:</b> {statusLabel[detailOrder.status] || detailOrder.status}
              </div>
              <div>
                <b>Ghi chú:</b> {detailOrder.note || '-'}
              </div>
              <div>
                <b>Sản phẩm:</b>
              </div>
              <ul>
                {(detailOrder.orderItems?.items || []).map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.quantity} - {(item.price || 0).toLocaleString('vi-VN')}đ
                  </li>
                ))}
              </ul>
              <div>
                <b>Tổng tiền:</b> {Number(detailOrder.totalAmount).toLocaleString('vi-VN')}đ
              </div>
              <button
                onClick={() => setShowDetail(false)}
                style={{ marginTop: 16, background: '#C92A15', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 600 }}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
