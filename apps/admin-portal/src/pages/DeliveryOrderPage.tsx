import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/order.api';

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

const provinces = ['Khánh Hòa'];
const districts = ['Chọn Quận/ Huyện'];
const wards = ['Chọn Phường/ Xã'];
const districtData: Record<string, string[]> = {
  'Khánh Hòa': ['TP Nha Trang'],
};
const wardData: Record<string, string[]> = {
  'TP Nha Trang': [
    // Phường
    'Phường Vĩnh Hòa',
    'Phường Vĩnh Hải',
    'Phường Phước Hải',
    'Phường Xương Huân',
    'Phường Vạn Thắng',
    'Phường Phước Tân',
    'Phường Lộc Thọ',
    'Phường Tân Lập',
    'Phường Phước Hòa',
    'Phường Vĩnh Nguyên',
    'Phường Vĩnh Trường',
    'Phường Vĩnh Thọ',
    'Phường Ngọc Hiệp',
    'Phường Phước Long',
    'Phường Phước Tiến',
    // Xã
    'Xã Vĩnh Thạnh',
    'Xã Vĩnh Phương',
    'Xã Vĩnh Ngọc',
    'Xã Vĩnh Lương',
    'Xã Vĩnh Trung',
    'Xã Phước Đồng',
    'Xã Vĩnh Hiệp',
    'Xã Vĩnh Thái',
  ],
};
const allWardsInKhanhHoa = Object.values(wardData).reduce((acc, arr) => acc.concat(arr), []);

const DeliveryOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { orderItems, dishes, clearCart } = useCart();
  const [form, setForm] = useState({
    useOldAddress: true,
    oldAddress: '',
    name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || '',
    phone: user?.phoneNumber || user?.phone_number || '',
    province: 'Hồ Chí Minh',
    district: '',
    ward: '',
    address: '',
    street: '',
    detail: '',
    timeType: 'now',
    time: '',
    date: getValidDates()[0],
  });
  const orderType = localStorage.getItem('orderType') || 'pickup';

  useEffect(() => {
    if (user) {
      let name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '';
      let phone = user.phoneNumber || user.phone_number || '';
      let address = '', street = '', ward = '', district = '', province = 'Khánh Hòa';
      if (user.address) {
        const parts = user.address.split(',').map(s => s.trim());
        address = parts[0] || '';
        street = parts[1] || '';
        ward = parts[2] || '';
        district = parts[3] || '';
      }
      setForm(f => ({
        ...f,
        name,
        phone,
        address,
        street,
        ward,
        district,
        province,
      }));
    }
  }, [user]);

  useEffect(() => {
    setForm(f => ({
      ...f,
      district: '',
      ward: '',
    }));
  }, [form.province]);
  useEffect(() => {
    setForm(f => ({
      ...f,
      ward: '',
    }));
  }, [form.district]);

  useEffect(() => {
    if (form.useOldAddress && user?.address) {
      const parts = user.address.split(',').map(s => s.trim());
      const province = 'Khánh Hòa';
      const districtList = districtData[province] || [];
      const district = districtList.includes(parts[3] || '') ? parts[3] || '' : '';
      const wardList = wardData[district] || [];
      const ward = wardList.includes(parts[2] || '') ? parts[2] || '' : '';
      setForm(f => ({
        ...f,
        address: parts[0] || '',
        street: parts[1] || '',
        ward: ward || '',
        district: district || '',
        province,
        detail: '',
      }));
    } else if (!form.useOldAddress) {
      setForm(f => ({
        ...f,
        address: '',
        street: '',
        ward: '',
        district: '',
        province: 'Khánh Hòa',
        detail: '',
      }));
    }
  }, [form.useOldAddress, user?.address]);

  useEffect(() => {
    if (form.timeType === 'custom' && (!form.time || !form.date)) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const minutes = now.getMinutes();
      const rounded = Math.ceil(minutes / 15) * 15;
      const time = pad(now.getHours()) + ':' + pad(rounded === 60 ? 0 : rounded);
      const date = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
      setForm(f => ({ ...f, time, date }));
    }
  }, [form.timeType]);

  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getItemPrice = (item: any) => {
    const dish = dishes.find((d: any) => d.id === item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      const topping = dishes.find((d: any) => d.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
    }
    return price;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.province || !form.district || !form.ward || !form.address) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }
    const items = orderItems.map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      return {
        ...item,
        name: dish?.name || '-',
        image: dish?.imageUrl || '',
        price: getItemPrice(item),
      };
    });
    const subtotal = items.reduce((sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0), 0);
    const shippingFee = orderType === 'delivery' ? 25000 : 0;
    const totalAmount = subtotal + shippingFee;
    navigate('/payment-info', {
      state: {
        orderType,
        address: form.address,
        ward: form.ward,
        district: form.district,
        province: form.province,
        detail: form.detail,
        name: form.name,
        phone: form.phone,
        items,
        subtotal,
        shippingFee,
        totalAmount,
      }
    });
  };

  const wardsInSelectedDistrict = wardData[form.district] || [];

  return (
    <div style={{ background: '#f6fff8', minHeight: '100vh' }}>
      <Navbar />
      <div style={{maxWidth: 1100, margin: '40px auto', padding: 32, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
        <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Đặt giao hàng</div>
        <hr style={{margin: '16px 0 32px 0'}} />
        <div style={{display: 'flex', gap: 32}}>
          {/* LEFT: Thông tin nhận hàng */}
          <div style={{flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#166534', borderLeft: '4px solid #16a34a', paddingLeft: 8}}>Thông tin nhận hàng</div>
            <label style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <input type="checkbox" checked={form.useOldAddress} onChange={e => setForm(f => ({...f, useOldAddress: e.target.checked}))} style={{marginRight:8}} /> Sử dụng địa chỉ cũ
            </label>
            <select style={{width:'100%',marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} value={form.oldAddress || ''} onChange={e => setForm(f => ({...f, oldAddress: e.target.value}))} disabled={!form.useOldAddress}>
              <option value="">Chọn địa chỉ ...</option>
              {/* TODO: map địa chỉ cũ từ user */}
            </select>
            <label>Họ và tên: <span style={{color:'red'}}>*</span></label>
            <input value={form.name || ''} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <label>Số điện thoại: <span style={{color:'red'}}>*</span></label>
            <input value={form.phone || ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <label>Tỉnh/Thành <span style={{color:'red'}}>*</span></label>
            <select value={form.province || 'Khánh Hòa'} disabled style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16,background:'#f3f4f6'}}>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label>Quận/Huyện <span style={{color:'red'}}>*</span></label>
            <select value={form.district || ''} onChange={e => setForm(f => ({...f, district: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}}>
              <option value="">Chọn Quận/ Huyện</option>
              {(districtData['Khánh Hòa'] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <label>Phường/Xã <span style={{color:'red'}}>*</span></label>
            <select value={form.ward || ''} onChange={e => setForm(f => ({...f, ward: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}}>
              <option value="">Chọn Phường/ Xã</option>
              {allWardsInKhanhHoa.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <label>Địa chỉ: <span style={{color:'red'}}>*</span></label>
            <input value={form.address || ''} onChange={e => setForm(f => ({...f, address: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} placeholder="Nhập số nhà, tên đường, hẻm, khu vực..." />
            <label>Thông tin chi tiết:</label>
            <input value={form.detail || ''} onChange={e => setForm(f => ({...f, detail: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <div style={{fontSize:13,marginBottom:4}}>Vui lòng nhập đủ Hẻm/ Ngõ/ Ngách/ Kiệt/ Thôn/ Ấp/ Chung Cư/ Khu Đô Thị/ Khu Dân Cư/ Số Căn Hộ cụ thể kèm những yêu cầu khác (nếu có) để hướng dẫn cho nhân viên giao hàng.</div>
          </div>
          {/* RIGHT: Chọn thời gian nhận hàng */}
          <div style={{flex: 1}}>
            <div style={{fontWeight: 600, fontSize: 20, marginBottom: 16, color: '#166534', borderLeft: '4px solid #16a34a', paddingLeft: 8}}>Chọn thời gian nhận hàng</div>
            <label style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <input type="radio" checked={form.timeType === 'now'} onChange={() => setForm(f => ({...f, timeType: 'now'}))} style={{marginRight:8}} /> Ngay bây giờ (tối thiểu 30 phút sau khi đặt hàng thành công)
            </label>
            <label style={{display:'flex',alignItems:'center',marginBottom:8}}>
              <input type="radio" checked={form.timeType === 'custom'} onChange={() => setForm(f => ({...f, timeType: 'custom'}))} style={{marginRight:8}} /> Chọn thời gian
            </label>
            {form.timeType === 'custom' && (
              <div style={{display:'flex', gap:12, marginTop:16}}>
                <select
                  value={form.time || ''}
                  onChange={e => setForm(f => ({...f, time: e.target.value}))}
                  style={{flex:1, background:'#fafafa', border:'2px solid #16a34a', borderRadius:8, padding:'12px 16px', fontSize:18, color:'#222'}}
                >
                  <option value="">Chọn giờ</option>
                  {getValidTimes(form.date || '').map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={form.date || ''}
                  onChange={e => setForm(f => ({...f, date: e.target.value}))}
                  style={{flex:1, background:'#fafafa', border:'2px solid #16a34a', borderRadius:8, padding:'12px 16px', fontSize:18, color:'#222'}}
                >
                  {getValidDates().map(d => {
                    const [yyyy, MM, dd] = d.split('-');
                    return <option key={d} value={d}>{`${dd}/${MM}/${yyyy}`}</option>;
                  })}
                </select>
              </div>
            )}
            <div style={{display:'flex', gap:24, marginTop:48, justifyContent:'flex-end'}}>
              <button onClick={() => navigate(-1)} style={{background:'#6b9080',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontSize:18,fontWeight:600,cursor:'pointer'}}>Quay lại</button>
              <button
                onClick={handleSubmit}
                style={{
                  background: '#C92A15',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 120,
                  transition: 'all 0.2s',
                }}
              >
                Thanh toán &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderPage; 