import React, { useEffect, useState, useContext, useRef } from 'react';
import { User as UserIcon, Edit, Trash2, LogOut, Star } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import '../css/ReviewAdminPage.css';
import axios from 'axios';
import { getAllUsers, User } from '../services/user.api';
import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';
import { deleteReview, updateReview, respondReview } from '../services/review.api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Star Rating Component
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'star' : 'star empty'}
          fill={star <= rating ? '#ffd700' : 'none'}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
}

export default function ReviewAdminPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [starFilter, setStarFilter] = useState<number|null>(null);
  // Thêm state để lưu review đang phản hồi
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  const fetchReviews = () => {
    setPageLoading(true);
    Promise.all([
      axios.get('/api/v1/reviews'),
      getAllUsers(1, 1000),
      getAllDishes(),
      axios.get('/api/v1/orders')
    ])
      .then(([reviewsRes, usersRes, dishesRes, ordersRes]) => {
        const reviewsArr = Array.isArray(reviewsRes.data?.data?.data) ? reviewsRes.data.data.data : [];
        setReviews(reviewsArr);
        
        const sortedUsers = [...(usersRes.users || [])].sort((a, b) => {
          if ((b.isActive ? 1 : 0) !== (a.isActive ? 1 : 0)) {
            return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setUsers(sortedUsers);
        setDishes(dishesRes);
        
        const ordersArr = Array.isArray(ordersRes.data?.data?.data) ? ordersRes.data.data.data : [];
        setOrders(ordersArr);
      })
      .catch(() => setError('Cannot load reviews or related data'))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    fetchReviews();
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
    if (!userId) return 'Unknown';
    const user = users.find(u => u.id === userId);
    if (user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (name) return name;
      if (user.email) return user.email;
      return user.id;
    }
    return userId;
  };

  const getOrderInfo = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      return {
        orderNumber: order.order_number || order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      };
    }
    return { orderNumber: 'Unknown', totalAmount: 0, status: 'Unknown' };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('en-US');
  };

  // Filter reviews by customer name/order number and star rating
  const filteredReviews = reviews
    .filter(review => {
      const userName = getUserName(review.userId) || '';
      const orderInfo = getOrderInfo(review.orderId);
      const orderNumber = orderInfo.orderNumber ? `#${orderInfo.orderNumber}` : '';
      const matchSearch = userName.toLowerCase().includes(search.toLowerCase()) || 
             orderNumber.toLowerCase().includes(search.toLowerCase());
      const matchStar = starFilter ? review.rating === starFilter : true;
      return matchSearch && matchStar;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setSaving(true);
    try {
      await deleteReview(id);
      fetchReviews();
    } catch {
      alert('Delete failed');
    }
    setSaving(false);
  };

  const handleEdit = (review: any) => {
    setEditingReview(review);
    setShowEdit(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        rating: editingReview.rating,
        comment: editingReview.comment,
        isActive: editingReview.isActive
      };
      
      const res = await updateReview(editingReview.id, payload);
      if (res?.statusCode && res.statusCode === 200) {
        setShowEdit(false);
        fetchReviews();
      } else {
        let msg = '';
        if (Array.isArray(res.message)) msg = res.message.map((m: any) => typeof m === 'object' ? JSON.stringify(m) : m).join(', ');
        else if (typeof res.message === 'object') msg = JSON.stringify(res.message);
        else msg = res.message || 'Unknown error';
        alert('Update failed: ' + msg);
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
        msg = err?.message || 'Unknown error';
      }
      alert('Update failed: ' + msg);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('order-eat-access-token');
    localStorage.removeItem('order-eat-refresh-token');
    navigate('/login');
  };

  // Gợi ý phản hồi admin theo số sao
  const adminReplySuggestions: Record<number, string[]> = {
    1: [
      'Chúng tôi chân thành xin lỗi vì trải nghiệm không tốt của bạn. Chúng tôi sẽ kiểm tra lại và cải thiện dịch vụ sớm nhất.',
      'Rất tiếc vì món ăn/dịch vụ không đạt kỳ vọng. Cảm ơn bạn đã phản hồi để chúng tôi phục vụ tốt hơn trong tương lai.',
      'Xin lỗi bạn vì sự bất tiện vừa qua. Cửa hàng sẽ xem xét lại quy trình để không lặp lại điều này.',
    ],
    2: [
      'Cảm ơn bạn đã phản hồi. Chúng tôi sẽ rà soát lại vấn đề và cố gắng nâng cao chất lượng món ăn.',
      'Rất tiếc vì bạn chưa hài lòng. Chúng tôi sẽ nỗ lực cải thiện để phục vụ bạn tốt hơn trong những lần sau.',
      'Chúng tôi trân trọng góp ý của bạn và đang xem xét để điều chỉnh hợp lý.',
    ],
    3: [
      'Cảm ơn bạn đã góp ý. Chúng tôi hy vọng sẽ mang lại trải nghiệm tốt hơn ở lần đặt hàng tới.',
      'Cửa hàng đã ghi nhận phản hồi của bạn và sẽ cải thiện thêm. Rất mong được phục vụ bạn lần sau.',
      'Chúng tôi đang nỗ lực mỗi ngày để hoàn thiện. Cảm ơn bạn vì sự đóng góp.',
    ],
    4: [
      'Cảm ơn bạn đã đánh giá tốt! Chúng tôi sẽ cố gắng hơn nữa để đạt 5 sao trong lần tới.',
      'Rất vui khi nhận được phản hồi tích cực từ bạn. Cảm ơn bạn đã ủng hộ!',
      'Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ. Mong được phục vụ bạn nhiều lần nữa!',
    ],
    5: [
      'Cảm ơn bạn rất nhiều vì đánh giá tuyệt vời! Đó là nguồn động lực lớn với cửa hàng.',
      'Thật vui khi bạn hài lòng với món ăn và dịch vụ. Hẹn gặp lại bạn sớm!',
      'Cảm ơn bạn đã tin tưởng và ủng hộ. Chúc bạn một ngày tuyệt vời!',
    ],
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
                  Account
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                  <LogOut size={18} className="text-red-400" />
                  Logout
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
          <h1 className="text-2xl font-bold text-[#C92A15]">Review Management</h1>
        </div>
        {/* Search and star filter layout */}
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex justify-end">
            <input
              type="text"
              placeholder="Search by customer name or order number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
            />
          </div>
          <div className="review-star-filter-group">
            <button
              className={`review-star-filter-btn${starFilter === null ? ' selected' : ''}`}
              onClick={() => setStarFilter(null)}
            >
              All
            </button>
            {[1,2,3,4,5].map(star => (
              <button
                key={star}
                className={`review-star-filter-btn${starFilter === star ? ' selected' : ''}`}
                onClick={() => setStarFilter(star)}
              >
                <Star size={15} fill="#ffd700" className="mr-1" />
                {star}
              </button>
            ))}
          </div>
        </div>
        
        {pageLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        
        {!pageLoading && !error && (
          <div className="overflow-x-auto">
            <table className="review-admin-table">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">No.</th>
                  <th className="py-2 px-3 border-b">Review Date</th>
                  <th className="py-2 px-3 border-b">Customer</th>
                  <th className="py-2 px-3 border-b">Order</th>
                  <th className="py-2 px-3 border-b">Rating</th>
                  <th className="py-2 px-3 border-b">Comment</th>
                  <th className="py-2 px-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review, index) => {
                  const orderInfo = getOrderInfo(review.orderId);
                  return (
                    <React.Fragment key={review.id}>
                      <tr className="hover:bg-gray-50 transition">
                        <td className="py-2 px-3 border-b font-medium">{index + 1}</td>
                        <td className="py-2 px-3 border-b">{formatDate(review.createdAt)}</td>
                        <td className="py-2 px-3 border-b">{getUserName(review.userId)}</td>
                        <td className="py-2 px-3 border-b">
                          <div>
                            <div className="font-medium">{orderInfo.orderNumber ? `#${orderInfo.orderNumber}` : 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{orderInfo.status}</div>
                            <div className="text-xs text-gray-700">{Number(orderInfo.totalAmount).toLocaleString('en-US')}đ</div>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b">
                          <StarRating rating={review.rating} />
                        </td>
                        <td className="py-2 px-3 border-b review-comment">
                          {review.comment || 'No comment'}
                        </td>
                        {review && (
                          <td className="py-2 px-3 border-b">
                            {review.adminReply ? (
                              <button
                                style={{
                                  width: '140px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#22c55e',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: 16,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(34,197,94,0.08)',
                                  transition: 'background 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto',
                                }}
                                onClick={() => setReplyingReviewId(review.id)}
                              >
                                Xem phản hồi
                              </button>
                            ) : (
                              <button
                                style={{
                                  width: '140px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  background: '#2563eb',
                                  color: '#fff',
                                  fontWeight: 600,
                                  fontSize: 16,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
                                  transition: 'background 0.2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto',
                                }}
                                title="Phản hồi"
                                onClick={() => {
                                  setReplyingReviewId(review.id);
                                  setReplyContent('');
                                }}
                              >
                                Phản hồi
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                      {replyingReviewId === review.id && review && (
                        <tr>
                          <td colSpan={8} style={{ background: '#f3f4f6', padding: 16 }}>
                            {/* Nếu đã có adminReply thì chỉ hiển thị nội dung phản hồi */}
                            {review.adminReply ? (
                              <div style={{ position: 'relative', fontStyle: 'italic', color: '#2563eb', fontSize: 16 }}>
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  style={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: 20,
                                    color: '#888',
                                    cursor: 'pointer',
                                    zIndex: 1,
                                  }}
                                  aria-label="Đóng"
                                >
                                  ×
                                </button>
                                <b>Phản hồi của admin:</b> {review.adminReply}
                              </div>
                            ) : (
                              <>
                                {/* Gợi ý phản hồi admin */}
                                {adminReplySuggestions[review.rating] && (
                                  <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {adminReplySuggestions[review.rating].map((suggestion, idx) => (
                                      <button
                                        key={idx}
                                        type="button"
                                        style={{
                                          background: '#fff',
                                          border: '1px solid #2563eb',
                                          color: '#2563eb',
                                          borderRadius: 6,
                                          padding: '4px 10px',
                                          fontSize: 14,
                                          cursor: 'pointer',
                                          marginBottom: 4,
                                          transition: 'background 0.2s',
                                        }}
                                        onClick={() => setReplyContent(suggestion)}
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <textarea
                                  value={replyContent}
                                  onChange={e => setReplyContent(e.target.value)}
                                  placeholder="Nhập phản hồi..."
                                  style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid #d1d5db', padding: 8, fontSize: 15 }}
                                />
                                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                  <button
                                    style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
                                    disabled={!replyContent.trim()}
                                    onClick={async () => {
                                      if (!replyContent.trim()) return;
                                      try {
                                        await respondReview(review.id, replyContent);
                                        setReplyingReviewId(null);
                                        setReplyContent('');
                                        if (typeof fetchReviews === 'function') fetchReviews();
                                      } catch (err) {
                                        alert('Gửi phản hồi thất bại!');
                                      }
                                    }}
                                  >
                                    Gửi phản hồi
                                  </button>
                                  <button
                                    style={{ background: '#e5e7eb', color: '#111', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
                                    onClick={() => setReplyingReviewId(null)}
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {showEdit && editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <form className="bg-white p-6 rounded shadow-md min-w-[400px]" onSubmit={handleEditSubmit}>
              <h2 className="text-lg font-bold mb-4">Edit Review</h2>
              
              <div className="mb-3">
                <label className="block text-sm font-medium">Rating</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingReview.rating}
                  onChange={e => setEditingReview({ ...editingReview, rating: Number(e.target.value) })}
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium">Comment</label>
                <textarea
                  className="w-full border rounded px-2 py-1"
                  value={editingReview.comment || ''}
                  onChange={e => setEditingReview({ ...editingReview, comment: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium">Status</label>
                <select
                  className="w-full border rounded px-2 py-1"
                  value={editingReview.isActive ? 'true' : 'false'}
                  onChange={e => setEditingReview({ ...editingReview, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowEdit(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 