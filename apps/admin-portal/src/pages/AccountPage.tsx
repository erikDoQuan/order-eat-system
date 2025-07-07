import React, { useContext, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { AuthContext } from '../context/AuthContext';
import { updateUser } from '../services/user.api';
import { fetchMe } from '../services/me.api';
import { getOrdersByUserId } from '../services/order.api';
import { getAllDishes } from '../services/dish.api';
import { Dish } from '../types/dish.type';

import '../css/AccountPage.css';

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

  // Luôn đồng bộ form với user mỗi khi user thay đổi
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
        setRecentOrders(sorted.slice(0, 3));
      });
    }
  }, [user?.id]);

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
            Tài khoản của
            <div className="account-username">
              {user?.firstName || ''} {user?.lastName || ''}
            </div>
          </div>
          <ul className="account-menu">
            <li className={tab==='info' ? 'active' : ''} onClick={()=>setTab('info')}>Thông tin khách hàng</li>
            <li>Số địa chỉ</li>
            <li className={tab==='history' ? 'active' : ''} onClick={()=>setTab('history')}>Lịch sử mua hàng</li>
            <li className={tab==='password' ? 'active' : ''} onClick={()=>setTab('password')}>Đổi mật khẩu</li>
            <li>Voucher của tôi</li>
          </ul>
        </div>
        <div className="account-main">
          {tab === 'info' && <h1 className="account-main-title">Thông tin chung</h1>}
          {tab === 'password' && <h1 className="account-main-title">Đổi mật khẩu</h1>}
          {tab === 'history' && (
            <>
              <div className="account-orders-box">
                <h1 className="account-main-title">Tra cứu đơn hàng</h1>
                <form onSubmit={handleSearch} style={{marginBottom: 0}}>
                  <div style={{fontWeight: 600, fontSize: 18, marginBottom: 10}}>Nhập số điện thoại hoặc mã đơn hàng</div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder="Nhập số điện thoại hoặc mã đơn hàng"
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
                    Tra Cứu
                  </button>
                </form>
              </div>
              <div className="account-orders-box" style={{marginTop: 32}}>
                <h2 className="account-main-title" style={{fontSize: 28, marginBottom: 18}}>Lịch sử đơn hàng</h2>
                <div className="account-recent-orders">
                  {(searchResult !== null ? searchResult : recentOrders.filter(order => order.status === 'completed')).length === 0 && (
                    <div className="text-gray-500">Bạn chưa có đơn hàng hoàn thành nào</div>
                  )}
                  <table className="table-recent-orders" style={{width:'100%',marginTop:8}}>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Sản Phẩm</th>
                        <th>Ngày mua</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(searchResult !== null ? searchResult : recentOrders.filter(order => order.status === 'completed')).map(order => {
                        const items = (order.orderItems?.items || []);
                        const dishNames = items.map((item: any) => getDishName(item.dishId)).join(', ');
                        const orderNumber = order.order_number || order.orderNumber || '-';
                        const orderLink = `/orders/${orderNumber}`;
                        const date = new Date(order.createdAt);
                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        let statusText = '';
                        if (order.status === 'cancelled') statusText = 'Đã hủy';
                        else if (order.status === 'completed') statusText = 'Hoàn thành';
                        else if (order.status === 'confirmed') statusText = 'Đã xác nhận';
                        else if (order.status === 'pending') statusText = 'Chờ xác nhận';
                        else statusText = order.status;
                        return (
                          <tr key={order.id}>
                            <td>
                              <a href={orderLink} style={{ color: '#1787e0', textDecoration: 'underline', cursor: 'pointer' }}>{orderNumber}</a>
                            </td>
                            <td style={{whiteSpace:'pre-line'}}>{dishNames}</td>
                            <td>{dateStr}</td>
                            <td>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                            <td className={
                              order.status === 'cancelled' ? 'order-status-cancelled' :
                              order.status === 'completed' ? 'order-status-completed' :
                              order.status === 'confirmed' ? 'order-status-confirmed' : ''
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
          {tab === 'info' && (
            <>
              <div className="account-info-box">
                <div className="account-info-header">
                  <span className="account-info-title">THÔNG TIN TÀI KHOẢN</span>
                  {!editing && (
                    <button className="account-edit-btn" onClick={handleEdit}>
                      <span style={{ color: '#1976d2', fontSize: 15, marginRight: 4 }}>✎</span> Chỉnh sửa
                    </button>
                  )}
                </div>
                {!editing ? (
                  <div className="account-info-content">
                    <div>
                      <b>Họ và tên</b>
                      <span>{form.name}</span>
                    </div>
                    <div>
                      <b>Số điện thoại</b>
                      <span>{form.phone ? form.phone : <span className="text-gray-400">-</span>}</span>
                    </div>
                    <div>
                      <b>Email</b>
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
                        Họ và tên <span style={{ color: 'red' }}>*</span>
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
                        Số điện thoại
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
                        E-mail
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
                        <span style={{ fontSize: 20, marginRight: 6 }}>✎</span> Cập nhật
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <div className="account-orders-box">
                <span className="account-orders-title">ĐƠN HÀNG GẦN ĐÂY NHẤT</span>
                <div className="account-recent-orders">
                  {recentOrders.length === 0 && <div className="text-gray-500">Bạn chưa có đơn hàng nào</div>}
                  <table className="table-recent-orders" style={{width:'100%',marginTop:8}}>
                    <thead>
                      <tr>
                        <th>Mã</th>
                        <th>Sản Phẩm</th>
                        <th>Ngày mua</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.slice(0, 3).map(order => {
                        const items = (order.orderItems?.items || []);
                        const dishNames = items.map((item: any) => getDishName(item.dishId)).join(', ');
                        const orderNumber = order.order_number || order.orderNumber || '-';
                        const orderLink = `/orders/${orderNumber}`;
                        const date = new Date(order.createdAt);
                        const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        let statusText = '';
                        if (order.status === 'cancelled') statusText = 'Đã hủy';
                        else if (order.status === 'completed') statusText = 'Hoàn thành';
                        else if (order.status === 'confirmed') statusText = 'Đã xác nhận';
                        else if (order.status === 'pending') statusText = 'Chờ xác nhận';
                        else statusText = order.status;
                        return (
                          <tr key={order.id}>
                            <td>
                              <a href={orderLink} style={{ color: '#1787e0', textDecoration: 'underline', cursor: 'pointer' }}>{orderNumber}</a>
                            </td>
                            <td style={{whiteSpace:'pre-line'}}>{dishNames}</td>
                            <td>{dateStr}</td>
                            <td>{Number(order.totalAmount).toLocaleString('vi-VN')}đ</td>
                            <td className={
                              order.status === 'cancelled' ? 'order-status-cancelled' :
                              order.status === 'completed' ? 'order-status-completed' :
                              order.status === 'confirmed' ? 'order-status-confirmed' : ''
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
                  label: <>Mật khẩu cũ</>,
                  value: pwForm.oldPassword,
                  onChange: (e:any) => setPwForm(f => ({ ...f, oldPassword: e.target.value })),
                  name: 'oldPassword',
                  show: showPw.old,
                  toggle: () => setShowPw(s => ({ ...s, old: !s.old })),
                }, {
                  label: <>Mật khẩu mới</>,
                  value: pwForm.newPassword,
                  onChange: (e:any) => setPwForm(f => ({ ...f, newPassword: e.target.value })),
                  name: 'newPassword',
                  show: showPw.new,
                  toggle: () => setShowPw(s => ({ ...s, new: !s.new })),
                }, {
                  label: <>Xác nhận mật khẩu</>,
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
                  Đổi mật khẩu
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
