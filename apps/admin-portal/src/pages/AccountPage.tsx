import React, { useContext, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaBell } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateUser } from '../services/user.api';
import { fetchMe } from '../services/me.api';
import { getOrdersByUserId } from '../services/order.api';
import { getAllDishes } from '../services/dish.api';
import { createReview, getReviewsByUserId } from '../services/review.api';
import { Dish } from '../types/dish.type';
import '../css/AccountPage.css';
import ReviewForm from '../components/ReviewForm';
import axios from '../services/axios';

export default function AccountPage() {
  const { user, setUser } = useContext(AuthContext);
  const [phone, setPhone] = useState(user?.phoneNumber || user?.phone_number || '');
  const address = user?.address || '---';
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: (user?.firstName || '') + (user?.lastName ? ' ' + user.lastName : ''),
    phone: user?.phoneNumber || user?.phone_number || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'info'|'password'|'history'>('info');
  const [pwForm, setPwForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState<any[]|null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 5;
  const paginatedOrders = (searchResult !== null ? searchResult : recentOrders.filter(order => order.status === 'completed'));
  const totalPages = Math.ceil(paginatedOrders.length / ORDERS_PER_PAGE);
  const displayedOrders = paginatedOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);
  const { t } = useTranslation();
  const [showNewOrderNotification, setShowNewOrderNotification] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [thankYouOrderId, setThankYouOrderId] = useState<string | null>(null);

  // Debug: Kiểm tra user và token
  useEffect(() => {
    console.log('🔍 Debug - User:', user);
    const token = localStorage.getItem('order-eat-access-token');
    console.log('🔍 Debug - Token exists:', !!token);
    if (token) {
      console.log('🔍 Debug - Token:', token.substring(0, 20) + '...');
    }
  }, [user]);

  useEffect(() => {
    setForm({
      name: (user?.firstName || '') + (user?.lastName ? ' ' + user.lastName : ''),
      phone: user?.phoneNumber || user?.phone_number || '',
      email: user?.email || '',
    });
  }, [user]);

  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  useEffect(() => {
    if (user?.id) {
      getOrdersByUserId(user.id).then(orders => {
        const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentOrders(sorted);
      });
    }
  }, [user?.id]);

  useEffect(() => {
    let timeout: any;
    const checkOrderNotification = async () => {
      if (!user?.id) return;
      const orders = await getOrdersByUserId(user.id);
      // Lọc ra các đơn đã xác nhận hoặc hoàn thành
      const validOrders = orders.filter((o: any) => o.status === 'confirmed' || o.status === 'completed');
      if (validOrders.length > 0) {
        setShowNewOrderNotification(true);
        timeout = setTimeout(() => setShowNewOrderNotification(false), 5000);
      }
    };
    checkOrderNotification();
    return () => clearTimeout(timeout);
  }, [user]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!user?.id) throw new Error('Không xác định được người dùng');
      const [firstName, ...lastNameArr] = form.name.trim().split(' ');
      const payload = {
        firstName,
        lastName: lastNameArr.join(' '),
        phoneNumber: form.phone,
        email: form.email,
      };
      await updateUser(user.id, payload);
      const me = await fetchMe();
      if (me && me.email) {
        setUser && setUser({
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          phoneNumber: me.phoneNumber,
          address: me.address,
          role: me.role,
        });
        setForm({
          name: (me.firstName || '') + (me.lastName ? ' ' + me.lastName : ''),
          phone: me.phoneNumber || '',
          email: me.email || '',
        });
      }
      setPhone(me.phoneNumber || '');
      setEditing(false);
    } catch (err: any) {
      alert('Cập nhật thất bại: ' + (err?.response?.data?.message || err?.message || ''));
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.newPassword || !pwForm.confirmPassword || !pwForm.oldPassword) {
      alert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }
    if (pwForm.oldPassword === pwForm.newPassword) {
      alert('Mật khẩu mới phải khác mật khẩu cũ!');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (!user || !user.id) {
      alert('Không xác định được người dùng!');
      setPwSaving(false);
      return;
    }
    setPwSaving(true);
    try {
      await updateUser(user.id as string, { password: pwForm.newPassword });
      alert('Đổi mật khẩu thành công! Hãy đăng nhập lại bằng mật khẩu mới.');
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert('Đổi mật khẩu thất bại: ' + (err?.response?.data?.message || err?.message || ''));
    }
    setPwSaving(false);
  };

  const getDishName = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : dishId;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchValue.trim();
    if (!value) {
      setSearchResult(null);
      return;
    }
    const filtered = recentOrders.filter(order => {
      if (order.status !== 'completed') return false;
      const phone = order.phoneNumber || order.phone_number || '';
      const orderNum = String(order.order_number || order.orderNumber || '');
      const id = String(order.id || '');
      return (
        phone.includes(value) ||
        orderNum.includes(value) ||
        id.includes(value)
      );
    });
    setSearchResult(filtered);
  };

  return (
    <>
      <div className="account-container">
        <div className="account-sidebar">
          <div className="account-title">
            {t('account_of')}
            <div className="account-username">
              {user?.firstName || ''} {user?.lastName || ''}
            </div>
          </div>
          <ul className="account-menu">
            <li className={tab==='info' ? 'active' : ''} onClick={()=>setTab('info')}>{t('customer_info')}</li>
            <li>{t('address_count')}</li>
            <li className={tab==='history' ? 'active' : ''} onClick={()=>setTab('history')}>{t('purchase_history')}</li>
            <li className={tab==='password' ? 'active' : ''} onClick={()=>setTab('password')}>{t('change_password')}</li>
            <li>{t('my_voucher')}</li>
          </ul>
        </div>
        <div className="account-main">
          {tab === 'info' && <h1 className="account-main-title">{t('general_info')}</h1>}
          {tab === 'password' && <h1 className="account-main-title">{t('change_password_title')}</h1>}
          {tab === 'history' && (
            <>
              <div className="account-orders-box">
                <h1 className="account-main-title">{t('order_lookup')}</h1>
                <form onSubmit={handleSearch} style={{marginBottom: 0}}>
                  <div style={{fontWeight: 600, fontSize: 18, marginBottom: 10}}>{t('enter_phone_or_order')}</div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder={t('enter_phone_or_order')}
                    style={{width: '100%', padding: '16px', borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 17, background: '#fafafa', marginBottom: 18}}
                  />
                  <button type="submit" style={{
                    background: '#C92A15',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 22,
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 48px',
                    cursor: 'pointer',
                    marginTop: 0,
                    maxWidth: 320,
                    width: '100%',
                    boxShadow: '0 2px 8px #C92A1533',
                    letterSpacing: 0.1,
                    transition: 'background 0.2s',
                  }}>
                    {t('search')}
                  </button>
                </form>
              </div>
              <div className="account-orders-box" style={{marginTop: 32}}>
                <h2 className="account-main-title" style={{fontSize: 28, marginBottom: 18}}>{t('order_history')}</h2>
                <div className="account-recent-orders">
                  {(searchResult !== null ? searchResult : recentOrders.filter(order => order.status === 'completed')).length === 0 && (
                    <div className="text-gray-500">Bạn chưa có đơn hàng hoàn thành nào</div>
                  )}
                  <table className="table-recent-orders" style={{width:'100%',marginTop:8}}>
                    <thead>
                      <tr>
                        <th>{t('order_code')}</th>
                        <th>{t('product')}</th>
                        <th>{t('order_date')}</th>
                        <th>{t('total_amount')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedOrders.map(order => {
                        const items = (order.orderItems?.items || []);
                        const dishNames = items.map((item: any) => getDishName(item.dishId)).join(', ');
                        const orderNumber = order.order_number || order.orderNumber || '-';
                        const orderLink = `/orders/${order.id}`;
                        const date = new Date(order.createdAt);
                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        let statusText = '';
                        if (order.status === 'cancelled') statusText = t('order_cancelled');
                        else if (order.status === 'completed') statusText = t('order_completed');
                        else if (order.status === 'confirmed') statusText = t('order_confirmed');
                        else if (order.status === 'pending') statusText = t('order_pending');
                        else if (order.status === 'delivering') statusText = 'Đang giao hàng';
                        else statusText = order.status;
                        const isCompleted = ["completed", "hoàn thành"].includes((order.status || "").toLowerCase());
                        return (
                          <React.Fragment key={order.id}>
                            <tr>
                              <td>
                                <Link to={orderLink} style={{ color: '#1787e0', textDecoration: 'underline', cursor: 'pointer' }}>{orderNumber}</Link>
                              </td>
                              <td style={{whiteSpace:'pre-line'}}>{dishNames}</td>
                              <td className="order-date">{dateStr}</td>
                              <td>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                              <td className={
                                order.status === 'cancelled' ? 'order-status-cancelled' :
                                order.status === 'completed' ? 'order-status-completed' :
                                order.status === 'confirmed' ? 'order-status-confirmed' :
                                order.status === 'delivering' ? 'order-status-delivering' :
                                order.status === 'pending' ? 'order-status-pending' : ''
                              }>{statusText}</td>
                            </tr>
                            {isCompleted && (!order.reviews || order.reviews.length === 0) && (
                              <tr>
                                <td colSpan={5}>
                                  <ReviewForm
                                    orderId={order.id}
                                    existingReview={order.reviews?.[0]}
                                    onSubmit={async ({ orderId, rating, comment }) => {
                                      await createReview({ 
                                        orderId, 
                                        rating, 
                                        comment,
                                        userId: user?.id // Thêm userId nếu user đã đăng nhập
                                      });
                                    }}
                                    onSuccess={async () => {
                                      setShowThankYou(true);
                                      setThankYouOrderId(order.id);
                                      // Reload lại review cho order này
                                      if (user?.id) {
                                        const updatedOrders = await getOrdersByUserId(user.id);
                                        setRecentOrders(updatedOrders);
                                      }
                                      setTimeout(() => {
                                        setShowThankYou(false);
                                        setThankYouOrderId(null);
                                      }, 2000);
                                    }}
                                  />
                                  {showThankYou && thankYouOrderId === order.id && (
                                    <div style={{marginTop:8, color:'#17823c', fontWeight:600, fontSize:16, background:'#e8f5e9', borderRadius:8, padding:'8px 16px', display:'inline-block'}}>
                                      Cảm ơn bạn đã đánh giá!
                                    </div>
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
              </div>
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16, gap: 8 }}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        background: currentPage === i + 1 ? '#17823c' : '#fff',
                        color: currentPage === i + 1 ? '#fff' : '#222',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === 'info' && (
            <>
              <div className="account-info-box">
                <div className="account-info-header">
                  <span className="account-info-title">{t('account_info')}</span>
                  {!editing && (
                    <button className="account-edit-btn" onClick={handleEdit}>
                      <span style={{ color: '#1976d2', fontSize: 15, marginRight: 4 }}>✎</span> {t('edit')}
                    </button>
                  )}
                </div>
                {!editing ? (
                  <div className="account-info-content">
                    <div>
                      <b>{t('full_name')}</b>
                      <span>{form.name}</span>
                    </div>
                    <div>
                      <b>{t('phone_number')}</b>
                      <span>{form.phone ? form.phone : <span className="text-gray-400">-</span>}</span>
                    </div>
                    <div>
                      <b>{t('email')}</b>
                      <span>{form.email}</span>
                    </div>
                  </div>
                ) : (
                  <form className="account-info-content" onSubmit={handleUpdate} style={{
                    width: '100%',
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #0001',
                    padding: '18px 0 18px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 0,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 14 }}>
                      <label style={{ fontWeight: 700, color: '#222', minWidth: 130, maxWidth: 130, marginRight: 0, fontSize: 16, letterSpacing: 0.1, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {t('full_name')} <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                        style={{
                          flex: 1,
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 16,
                          background: '#fafafa',
                          outline: 'none',
                          transition: 'border 0.2s',
                          marginLeft: 12,
                        }}
                        onFocus={e => (e.target.style.border = '1.5px solid #17823c')}
                        onBlur={e => (e.target.style.border = '1.5px solid #e0e0e0')}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 14 }}>
                      <label style={{ fontWeight: 700, color: '#222', minWidth: 130, maxWidth: 130, marginRight: 0, fontSize: 16, letterSpacing: 0.1, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {t('phone_number')}
                      </label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 16,
                          background: '#fafafa',
                          outline: 'none',
                          transition: 'border 0.2s',
                          marginLeft: 12,
                        }}
                        onFocus={e => (e.target.style.border = '1.5px solid #17823c')}
                        onBlur={e => (e.target.style.border = '1.5px solid #e0e0e0')}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 18 }}>
                      <label style={{ fontWeight: 700, color: '#222', minWidth: 130, maxWidth: 130, marginRight: 0, fontSize: 16, letterSpacing: 0.1, textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          boxSizing: 'border-box',
                          padding: '12px 16px',
                          borderRadius: 10,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 16,
                          background: '#fafafa',
                          outline: 'none',
                          transition: 'border 0.2s',
                          marginLeft: 12,
                        }}
                        onFocus={e => (e.target.style.border = '1.5px solid #17823c')}
                        onBlur={e => (e.target.style.border = '1.5px solid #e0e0e0')}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <div style={{ minWidth: 130, marginRight: 12 }}></div>
                      <button
                        type="submit"
                        disabled={saving}
                        style={{
                          background: '#C92A15',
                          color: 'white',
                          width: '100%',
                          border: 'none',
                          borderRadius: 10,
                          padding: '13px 0',
                          fontWeight: 700,
                          fontSize: 18,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 10,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px #C92A1533',
                          letterSpacing: 0.1,
                        }}
                      >
                        <span style={{ fontSize: 20, marginRight: 6 }}>✎</span> {t('update')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="account-orders-box">
                <span className="account-orders-title">{t('recent_orders')}</span>
                <div className="account-recent-orders">
                  {recentOrders.length === 0 && <div className="text-gray-500">{t('no_orders')}</div>}
                  <table className="table-recent-orders" style={{width:'100%',marginTop:8}}>
                    <thead>
                      <tr>
                        <th>{t('order_code')}</th>
                        <th>{t('product')}</th>
                        <th>{t('order_date')}</th>
                        <th>{t('total_amount')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.slice(0, 3).map(order => {
                        const items = (order.orderItems?.items || []);
                        const dishNames = items.map((item: any) => getDishName(item.dishId)).join(', ');
                        const orderNumber = order.order_number || order.orderNumber || '-';
                        const orderLink = `/orders/${order.id}`;
                        const date = new Date(order.createdAt);
                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        let statusText = '';
                        if (order.status === 'cancelled') statusText = t('order_cancelled');
                        else if (order.status === 'completed') statusText = t('order_completed');
                        else if (order.status === 'confirmed') statusText = t('order_confirmed');
                        else if (order.status === 'pending') statusText = t('order_pending');
                        else if (order.status === 'delivering') statusText = 'Đang giao hàng';
                        else statusText = order.status;
                        return (
                          <tr key={order.id}>
                            <td>
                              <Link to={orderLink} style={{ color: '#1787e0', textDecoration: 'underline', cursor: 'pointer' }}>{orderNumber}</Link>
                            </td>
                            <td style={{whiteSpace:'pre-line'}}>{dishNames}</td>
                            <td>{dateStr}</td>
                            <td>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                            <td className={
                              order.status === 'cancelled' ? 'order-status-cancelled' :
                              order.status === 'completed' ? 'order-status-completed' :
                              order.status === 'confirmed' ? 'order-status-confirmed' :
                              order.status === 'delivering' ? 'order-status-delivering' :
                              order.status === 'pending' ? 'order-status-pending' : ''
                            }>{statusText}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {tab === 'password' && (
            <div className="account-info-box">
              <form className="account-info-content" onSubmit={handleChangePassword} style={{
                width: '100%',
                background: 'none',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 0,
              }}>
                {[{
                  label: t('old_password'),
                  value: pwForm.oldPassword,
                  onChange: (e:any) => setPwForm(f => ({ ...f, oldPassword: e.target.value })),
                  name: 'oldPassword',
                  show: showPw.old,
                  toggle: () => setShowPw(s => ({ ...s, old: !s.old })),
                }, {
                  label: t('new_password'),
                  value: pwForm.newPassword,
                  onChange: (e:any) => setPwForm(f => ({ ...f, newPassword: e.target.value })),
                  name: 'newPassword',
                  show: showPw.new,
                  toggle: () => setShowPw(s => ({ ...s, new: !s.new })),
                }, {
                  label: t('confirm_password'),
                  value: pwForm.confirmPassword,
                  onChange: (e:any) => setPwForm(f => ({ ...f, confirmPassword: e.target.value })),
                  name: 'confirmPassword',
                  show: showPw.confirm,
                  toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })),
                }].map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: idx === 2 ? 18 : 14, maxWidth: 800 }}>
                    <label style={{ fontWeight: 700, color: '#222', minWidth: 140, maxWidth: 140, fontSize: 17, textAlign: 'left' }}>
                      {item.label}
                    </label>
                    <div style={{ position: 'relative', flex: 1, minWidth: 0, marginLeft: 12 }}>
                      <input
                        type={item.show ? 'password' : 'text'}
                        value={item.value}
                        onChange={item.onChange}
                        required
                        style={{
                          width: '100%',
                          maxWidth: 720,
                          boxSizing: 'border-box',
                          padding: '12px 40px 12px 16px',
                          borderRadius: 8,
                          border: '1.5px solid #e0e0e0',
                          fontSize: 16,
                          background: '#fafafa',
                          outline: 'none',
                          transition: 'border 0.2s',
                        }}
                        onFocus={e => (e.target.style.border = '1.5px solid #17823c')}
                        onBlur={e => (e.target.style.border = '1.5px solid #e0e0e0')}
                      />
                      <span onClick={item.toggle} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#888' }}>
                        {item.show ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{
                    background: '#C92A15',
                    color: 'white',
                    minWidth: 180,
                    maxWidth: 320,
                    width: '100%',
                    border: 'none',
                    borderRadius: 14,
                    padding: '14px 0',
                    fontWeight: 700,
                    fontSize: 20,
                    display: 'block',
                    margin: '24px 0 0 152px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #C92A1533',
                    letterSpacing: 0.1,
                    transition: 'background 0.2s',
                  }}
                >
                  {t('change_password')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      {showNewOrderNotification && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 32,
          background: '#fff',
          color: '#16a34a',
          border: '1.5px solid #16a34a',
          borderRadius: 12,
          boxShadow: '0 4px 24px #0002',
          padding: '16px 28px 16px 20px',
          fontWeight: 700,
          fontSize: 18,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'fadeInOut 5s',
        }}>
          <FaBell size={22} style={{ color: '#16a34a', marginRight: 6 }} />
          Bạn có 1 thông báo mới
        </div>
      )}
    </>
  );
}
