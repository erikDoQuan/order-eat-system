import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

// Hàm lấy 2 ngày: hôm nay và ngày mai
function getValidDates() {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return [format(today), format(tomorrow)];
}
// Hàm lấy giờ hợp lệ
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

// Chỉ cho phép chọn Nha Trang
const provinces = ['Khánh Hòa'];
const districts = ['Chọn Quận/ Huyện']; // TODO: lấy từ API theo tỉnh
const wards = ['Chọn Phường/ Xã']; // TODO: lấy từ API theo quận

// Demo dữ liệu tỉnh/thành, quận/huyện, phường/xã
const districtData: Record<string, string[]> = {
  'Khánh Hòa': ['TP Nha Trang'],
};
const wardData: Record<string, string[]> = {
  'TP Nha Trang': ['Phường Vĩnh Hòa', 'Phường Vĩnh Hải', 'Phường Phước Hải', 'Phường Xương Huân', 'Phường Vạn Thắng', 'Phường Phước Tân', 'Phường Lộc Thọ', 'Phường Tân Lập', 'Phường Phước Hòa', 'Phường Vĩnh Nguyên'],
};

// Gộp tất cả phường/xã của Khánh Hòa
const allWardsInKhanhHoa = Object.values(wardData).reduce((acc, arr) => acc.concat(arr), []);

const DeliveryOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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

  useEffect(() => {
    if (user) {
      // Fill họ tên, số điện thoại
      let name = user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || '';
      let phone = user.phoneNumber || user.phone_number || '';
      // Fill địa chỉ nếu có
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

  // Khi chọn tỉnh/thành, reset quận/huyện, phường/xã
  useEffect(() => {
    setForm(f => ({
      ...f,
      district: '',
      ward: '',
    }));
  }, [form.province]);
  // Khi chọn quận/huyện, reset phường/xã
  useEffect(() => {
    setForm(f => ({
      ...f,
      ward: '',
    }));
  }, [form.district]);

  // Fill địa chỉ cũ khi chọn checkbox
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

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.province || !form.district || !form.ward || !form.address || !form.street) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng!');
      return;
    }
    // TODO: gửi dữ liệu về backend
    alert('Đặt hàng thành công! (demo)');
  };

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
            <select style={{width:'100%',marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} value={form.oldAddress} onChange={e => setForm(f => ({...f, oldAddress: e.target.value}))} disabled={!form.useOldAddress}>
              <option value="">Chọn địa chỉ ...</option>
              {/* TODO: map địa chỉ cũ từ user */}
            </select>
            <label>Họ và tên: <span style={{color:'red'}}>*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <label>Số điện thoại: <span style={{color:'red'}}>*</span></label>
            <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <label>Tỉnh/Thành <span style={{color:'red'}}>*</span></label>
            <select value={form.province} disabled style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16,background:'#f3f4f6'}}>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <label>Quận/Huyện <span style={{color:'red'}}>*</span></label>
            <select value={form.district} onChange={e => setForm(f => ({...f, district: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}}>
              <option value="">Chọn Quận/ Huyện</option>
              {(districtData['Khánh Hòa'] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <label>Phường/Xã <span style={{color:'red'}}>*</span></label>
            <select value={form.ward} onChange={e => setForm(f => ({...f, ward: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}}>
              <option value="">Chọn Phường/ Xã</option>
              {allWardsInKhanhHoa.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <label>Số nhà: <span style={{color:'red'}}>*</span></label>
            <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:4,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <div style={{fontSize:13,color:'#b91c1c',marginBottom:4}}>* Lưu ý:</div>
            <div style={{fontSize:13,marginBottom:4}}>- Trong thời gian chuyển đổi địa giới hành chính, <b>quý khách vui lòng nhập địa chỉ giao hàng theo thông tin cũ (trước ngày 1/7/2025)</b>.</div>
            <div style={{fontSize:13,marginBottom:4}}>- Nếu nhà không có số, vui lòng nhập: 1</div>
            <div style={{fontSize:13,marginBottom:4}}>VD1: Nhà số 6 Hẻm hoặc Ngõ hoặc Kiệt 12 =&gt; Nhập: 12</div>
            <div style={{fontSize:13,marginBottom:4}}>VD2: Nhà số 6A hoặc 6bis hoặc H6 hoặc L6 =&gt; Nhập: 6</div>
            <label>Tên đường: <span style={{color:'red'}}>*</span></label>
            <input value={form.street} onChange={e => setForm(f => ({...f, street: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
            <label>Thông tin chi tiết:</label>
            <input value={form.detail} onChange={e => setForm(f => ({...f, detail: e.target.value}))} style={{width:'100%',marginTop:4,marginBottom:12,padding:'10px 12px',borderRadius:8,border:'1px solid #ccc',fontSize:16}} />
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
                  value={form.time}
                  onChange={e => setForm(f => ({...f, time: e.target.value}))}
                  style={{flex:1, background:'#fafafa', border:'2px solid #16a34a', borderRadius:8, padding:'12px 16px', fontSize:18, color:'#222'}}
                >
                  <option value="">Chọn giờ</option>
                  {getValidTimes(form.date).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={form.date}
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
            <div style={{marginTop:24, fontSize:15, color:'#444'}}>
              Quý khách có nhu cầu xuất hóa đơn GTGT, vui lòng quét mã QR trên biên lai mỗi hóa đơn hoặc truy cập <br/>
              <a href="https://evat-tpc.qsrvietnam.com/" target="_blank" rel="noopener noreferrer">https://evat-tpc.qsrvietnam.com/</a><br/>
              sau 60 phút và xuất hóa đơn trong vòng 120 phút kể từ lúc mua hàng.
            </div>
            <div style={{display:'flex', gap:24, marginTop:48, justifyContent:'flex-end'}}>
              <button onClick={() => navigate(-1)} style={{background:'#6b9080',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontSize:18,fontWeight:600,cursor:'pointer'}}>Quay lại</button>
              <button onClick={handleSubmit} style={{background:'#166534',color:'#fff',border:'none',borderRadius:8,padding:'12px 32px',fontSize:18,fontWeight:600,cursor:'pointer'}}>Thanh toán &rarr;</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrderPage; 