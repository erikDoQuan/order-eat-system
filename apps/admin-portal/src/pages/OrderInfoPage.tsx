import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const stores = [
  {
    id: 1,
    name: 'BẾP CỦA MẸ - TP NHA TRANG',
    address: '296/29 Lương Định Của, Nha Trang, Khánh Hòa',
    hotline: '0337782571',
  },
  {
    id: 2,
    name: 'BẾP CỦA MẸ VŨ LĂNG - TP NHA TRANG',
    address: '01 Vũ Lăng, Phường Phước Hải, Nha Trang, Khánh Hòa',
    hotline: '0337782571',
  },
];

function getValidDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return [format(today), format(tomorrow)];
}
function getValidTimes(selectedDate: string) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const minHour = 9;
  const maxHour = 22;
  let startHour = minHour;
  let startMinute = 0;
  if (selectedDate === todayStr) {
    if (now.getHours() < minHour) {
      startHour = minHour;
      startMinute = 0;
    } else if (now.getHours() >= minHour && now.getHours() < maxHour) {
      startHour = now.getHours();
      startMinute = Math.ceil(now.getMinutes() / 15) * 15;
      if (startMinute === 60) {
        startHour += 1;
        startMinute = 0;
      }
      if (startHour > maxHour) return [];
    } else {
      return [];
    }
  }
  const times: string[] = [];
  for (let h = startHour; h <= maxHour; h++) {
    for (let m = (h === startHour ? startMinute : 0); m < 60; m += 15) {
      if (h === maxHour && m > 0) break;
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
}

const OrderInfoPage: React.FC = () => {
  const query = useQuery();
  const location = useLocation();
  const orderType = location.state?.orderType || query.get('orderType');
  const deliveryAddress = location.state?.address || '';
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '',
    phone: user?.phoneNumber || user?.phone_number || '',
    timeType: 'now',
    time: '',
    date: '',
    storeId: 1,
    province: '',
    district: '',
    search: '',
  });

  useEffect(() => {
    setForm(f => ({
      ...f,
      name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '',
      phone: user?.phoneNumber || user?.phone_number || '',
    }));
  }, [user]);

  useEffect(() => {
    if (form.timeType === 'custom' && (!form.time || !form.date)) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const minutes = now.getMinutes();
      const rounded = Math.floor(minutes / 15) * 15;
      const time = pad(now.getHours()) + ':' + pad(rounded);
      const date = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
      setForm(f => ({ ...f, time, date }));
    }
  }, [form.timeType]);

  return (
    <div style={{ background: '#f6fff8', minHeight: '100vh' }}>
      <Navbar />
      <div style={{maxWidth: 1100, margin: '40px auto', padding: 32, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          {orderType === 'pickup' ? 'Đặt đến lấy' : 'Đặt giao hàng'}
        </div>
        <hr style={{margin: '16px 0 32px 0'}} />
        <div style={{display: 'flex', gap: 32}}>
          {/* LEFT: Thông tin nhận hàng */}
          <div style={{flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#b45309', borderLeft: '4px solid #b45309', paddingLeft: 8}}>Thông tin nhận hàng</div>
            <div style={{marginBottom: 16}}>
              <label style={{fontWeight: 500}}>Họ và tên: <span style={{color: 'red'}}>*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={{width: '100%', marginTop: 4, marginBottom: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16}} />
              <label style={{fontWeight: 500}}>Số điện thoại: <span style={{color: 'red'}}>*</span></label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={{width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', fontSize: 16}} />
            </div>
            <div style={{fontWeight: 600, fontSize: 20, margin: '32px 0 16px 0', color: '#b45309', borderLeft: '4px solid #b45309', paddingLeft: 8}}>Chọn thời gian nhận hàng</div>
            <div style={{marginBottom: 16}}>
              <label style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                <input type="radio" checked={form.timeType === 'now'} onChange={() => setForm(f => ({...f, timeType: 'now'}))} style={{marginRight: 8}} />
                Tối thiểu 15 phút sau khi đặt hàng thành công
              </label>
              <label style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
                <input type="radio" checked={form.timeType === 'custom'} onChange={() => setForm(f => ({...f, timeType: 'custom'}))} style={{marginRight: 8}} />
                Chọn thời gian
              </label>
              {form.timeType === 'custom' && (
                <div style={{display:'flex', gap:12, marginTop:16}}>
                  <select
                    value={form.time}
                    onChange={e => setForm(f => ({...f, time: e.target.value}))}
                    style={{flex:1, background:'#fafafa', border:'2px solid #b45309', borderRadius:8, padding:'12px 16px', fontSize:18, color:'#222'}}
                  >
                    <option value="">Chọn giờ</option>
                    {getValidTimes(form.date).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <select
                    value={form.date}
                    onChange={e => setForm(f => ({...f, date: e.target.value}))}
                    style={{flex:1, background:'#fafafa', border:'2px solid #b45309', borderRadius:8, padding:'12px 16px', fontSize:18, color:'#222'}}
                  >
                    {getValidDates().map(d => {
                      const [yyyy, MM, dd] = d.split('-');
                      return <option key={d} value={d}>{`${dd}/${MM}/${yyyy}`}</option>;
                    })}
                  </select>
                </div>
              )}
            </div>
          </div>
          {/* RIGHT: Chọn cửa hàng đến lấy */}
          <div style={{flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#b45309', borderLeft: '4px solid #b45309', paddingLeft: 8}}>
              {orderType === 'pickup' ? 'Nhận hàng tại:' : 'Giao hàng đến:'}
            </div>
            {orderType === 'pickup'
              ? <div>
                  <div style={{fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#b45309', borderLeft: '4px solid #b45309', paddingLeft: 8}}>Chọn cửa hàng đến lấy</div>
                  <div style={{display: 'flex', gap: 8, marginBottom: 8}}>
                    <input placeholder="Nhập tên cửa hàng để tìm kiếm" style={{flex:1, borderRadius:8, border:'1px solid #ccc', padding:'10px 12px', fontSize:16}} value={form.search} onChange={e => setForm(f => ({...f, search: e.target.value}))} />
                    <button style={{border:'none', background:'#b45309', color:'#fff', borderRadius:8, padding:'0 16px', fontSize:20, fontWeight:700, cursor:'pointer'}}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2"/>
                        <line x1="14.1213" y1="14.1213" x2="18" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{display:'flex', gap:8, marginBottom:16}}>
                    <button style={{flex:1, background:'#b45309', color:'#fff', border:'none', borderRadius:'8px 8px 0 0', padding:'8px 0', fontWeight:600, fontSize:16, cursor:'pointer'}}>Gần vị trí bạn</button>
                    <button style={{flex:1, background:'#fff', color:'#b45309', border:'1px solid #b45309', borderRadius:'8px 8px 0 0', padding:'8px 0', fontWeight:600, fontSize:16, cursor:'pointer'}}>Cửa hàng lọc được</button>
                  </div>
                  <div>
                    {stores.filter(s => s.name.toLowerCase().includes(form.search.toLowerCase())).map(store => (
                      <label key={store.id} style={{display:'block', border:'1px solid #b45309', borderRadius:12, padding:16, marginBottom:12, cursor:'pointer', background: form.storeId === store.id ? '#f6fff8' : '#fff', position:'relative'}}>
                        <input type="radio" name="store" checked={form.storeId === store.id} onChange={() => setForm(f => ({...f, storeId: store.id}))} style={{position:'absolute', left:16, top:16}} />
                        <div style={{marginLeft:32}}>
                          <div style={{fontWeight:700, color:'#b45309', fontSize:17, marginBottom:4}}>{store.name}</div>
                          <div style={{fontSize:15, color:'#444', marginBottom:2}}>📍 {store.address}</div>
                          <div style={{fontSize:15, color:'#444'}}>☎ Hotline: {store.hotline}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              : <div>{deliveryAddress}</div>
            }
          </div>
        </div>
        <div style={{marginTop:32, textAlign:'right'}}>
          <button
            onClick={() => {
              const selectedStore = stores.find(s => s.id === form.storeId);
              navigate('/payment-info', {
                state: {
                  store: selectedStore,
                  customer: { name: form.name, phone: form.phone },
                  timeType: form.timeType,
                  time: form.time,
                  date: form.date,
                  orderType,
                },
              });
            }}
            style={{padding: '8px 24px', borderRadius: 6, background: '#b45309', color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: 'pointer'}}>
            Xác nhận đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderInfoPage; 