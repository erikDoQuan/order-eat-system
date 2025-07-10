import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { register } from '../services/user.api';

import '../css/RegisterPage.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const province = 'Khánh Hòa';
  const districtData: Record<string, string[]> = {
    'Khánh Hòa': ['TP Nha Trang', 'TP Cam Ranh', 'Huyện Diên Khánh', 'Huyện Cam Lâm'],
  };
  const wardData: Record<string, string[]> = {
    'TP Nha Trang': ['Phường Vĩnh Hòa', 'Phường Vĩnh Hải', 'Phường Phước Hải', 'Phường Xương Huân', 'Phường Vạn Thắng', 'Phường Phước Tân', 'Phường Lộc Thọ', 'Phường Tân Lập', 'Phường Phước Hòa', 'Phường Vĩnh Nguyên'],
    'TP Cam Ranh': ['Phường Cam Lợi', 'Phường Cam Thuận'],
    'Huyện Diên Khánh': ['Xã Diên An', 'Xã Diên Toàn'],
    'Huyện Cam Lâm': ['Xã Cam Hải Đông', 'Xã Cam Hải Tây'],
  };
  const allWardsInKhanhHoa = Object.values(wardData).reduce((acc, arr) => acc.concat(arr), []);

  const commonStreets = [
    'Nguyễn Trãi', 'Trần Phú', 'Lý Tự Trọng', 'Thái Nguyên', 'Lê Lợi', 'Pasteur',
    'Yersin', 'Bạch Đằng', 'Tôn Đức Thắng', 'Võ Văn Tần', 'Nguyễn Thiện Thuật',
    'Lương Định Của', 'Vũ Lăng', 'Phạm Văn Đồng', 'Nguyễn Tất Thành', 'Trần Hưng Đạo',
    'Lê Thánh Tôn', 'Nguyễn Huệ', 'Hùng Vương', 'Lê Hồng Phong', 'Nguyễn Du',
    'Trần Quang Khải', 'Nguyễn Bỉnh Khiêm', 'Lê Quý Đôn', 'Nguyễn Công Trứ',
    'Đường 2/4', 'Đường 23/10', 'Đường 3/2', 'Đường 16/4', 'Đường 19/8',
    'Đường Trần Quý Cáp', 'Đường Nguyễn Khuyến', 'Đường Trần Cao Vân',
    'Đường Lê Đại Hành', 'Đường Nguyễn Thị Minh Khai', 'Đường Võ Thị Sáu',
    'Đường Nguyễn Thị Định', 'Đường Lê Văn Lương', 'Đường Nguyễn Văn Linh',
    'Đường Võ Nguyên Giáp', 'Đường Nguyễn Sinh Sắc', 'Đường Phan Chu Trinh',
    'Đường Huỳnh Thúc Kháng', 'Đường Trần Đại Nghĩa', 'Đường Nguyễn Văn Cừ',
    'Đường Lê Văn Việt', 'Đường Nguyễn Hữu Thọ', 'Đường Võ Văn Kiệt',
    'Đường Mai Chí Thọ', 'Đường Nguyễn Thị Thập', 'Đường Lê Văn Lương',
    'Đường Nguyễn Văn Quỳ', 'Đường Trần Văn Ơn', 'Đường Nguyễn Văn Trỗi',
    'Đường Võ Thị Sáu', 'Đường Nguyễn Thị Minh Khai', 'Đường Lê Thị Riêng',
    'Đường Nguyễn Thị Định', 'Đường Võ Thị Sáu', 'Đường Nguyễn Thị Minh Khai',
    'Đường Lê Thị Riêng', 'Đường Nguyễn Thị Định', 'Đường Võ Thị Sáu',
    'Đường Nguyễn Thị Minh Khai', 'Đường Lê Thị Riêng', 'Đường Nguyễn Thị Định'
  ];

  const validateEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  };
  const validatePhone = (phone: string) => {
    return /^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(phone);
  };
  const validatePassword = (pw: string) => {
    return pw.length >= 6;
  };

  const validateHouseNumber = (v: string) => v.trim().length > 0 && /^[\w\d\s/-]+$/.test(v.trim());
  const validateStreet = (v: string) => {
    const trimmed = v.trim();
    return trimmed.length > 0 && /^[a-zA-ZÀ-ỹĂăÂâĐđÊêÔôƠơƯư\s\d/-]+$/.test(trimmed);
  };
  const validateDistrict = (v: string) => (districtData[province] || []).includes(v);
  const validateWard = (v: string) => Object.values(wardData).flat().includes(v);

  const [addressErrors, setAddressErrors] = useState({
    houseNumber: '',
    street: '',
    district: '',
    ward: '',
  });

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let errors = { houseNumber: '', street: '', district: '', ward: '' };
    if (!validateHouseNumber(houseNumber)) {
      errors.houseNumber = 'Số nhà không hợp lệ';
    }
    if (!validateStreet(street)) {
      errors.street = 'Tên đường không hợp lệ';
    }
    if (!validateDistrict(district)) {
      errors.district = 'Vui lòng chọn Quận/Huyện hợp lệ';
    }
    if (!validateWard(ward)) {
      errors.ward = 'Vui lòng chọn Phường/Xã hợp lệ';
    }
    setAddressErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (!validateEmail(email)) {
      setMessage('Email không hợp lệ');
      return;
    }
    if (!validatePhone(phoneNumber)) {
      setMessage('Số điện thoại không hợp lệ');
      return;
    }
    if (!validatePassword(password)) {
      setMessage('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setMessage('');
    const address = `${houseNumber}, ${street}, ${ward}, ${district}, ${province}`;
    const res = await register(email, password, firstName, lastName, phoneNumber, address);
    if (res.message?.toLowerCase().includes('phone') || res.message?.toLowerCase().includes('số điện thoại')) {
      setMessage('Số điện thoại này đã tồn tại');
      setLoading(false);
      return;
    }
    if (res.message?.toLowerCase().includes('email')) {
      setMessage('Email này đã tồn tại');
      setLoading(false);
      return;
    }
    setMessage(res.message);
    setLoading(false);
    if (res.success) {
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  };

  const handleEmailChange = (v: string) => {
    setEmail(v);
    if (!v || v.trim() === '') setEmailError('');
    else if (!validateEmail(v)) setEmailError('Email không hợp lệ');
    else setEmailError('');
  };
  const handlePhoneChange = (v: string) => {
    setPhoneNumber(v);
    if (!v || v.trim() === '') setPhoneError('');
    else if (/[^0-9+]/.test(v)) setPhoneError('Chỉ được nhập số hoặc dấu + ở đầu');
    else if (v.length < 10) setPhoneError('');
    else if (!validatePhone(v)) setPhoneError('Số điện thoại không hợp lệ');
    else setPhoneError('');
  };
  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (!v || v.trim() === '') setPasswordError('');
    else if (!validatePassword(v)) setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
    else setPasswordError('');
    if (!confirmPassword || confirmPassword.trim() === '') setConfirmPasswordError('');
    else if (v !== confirmPassword) setConfirmPasswordError('Mật khẩu xác nhận không khớp');
    else setConfirmPasswordError('');
  };
  const handleConfirmPasswordChange = (v: string) => {
    setConfirmPassword(v);
    if (!v || v.trim() === '') setConfirmPasswordError('');
    else if (password !== v) setConfirmPasswordError('Mật khẩu xác nhận không khớp');
    else setConfirmPasswordError('');
  };
  const handleHouseNumberChange = (v: string) => {
    setHouseNumber(v);
    setAddressErrors(errors => ({...errors, houseNumber: (!v || v.trim() === '') ? '' : (!validateHouseNumber(v) ? 'Số nhà không hợp lệ' : '')}));
  };
  const handleStreetChange = (v: string) => {
    setStreet(v);
    setAddressErrors(errors => ({...errors, street: (!v || v.trim() === '') ? '' : (!validateStreet(v) ? 'Tên đường không hợp lệ' : '')}));
  };
  const handleDistrictChange = (v: string) => {
    setDistrict(v);
    setWard('');
    setAddressErrors(errors => ({...errors, district: (!v || v.trim() === '') ? '' : (!validateDistrict(v) ? 'Vui lòng chọn Quận/Huyện hợp lệ' : '')}));
  };
  const handleWardChange = (v: string) => {
    setWard(v);
    setAddressErrors(errors => ({...errors, ward: (!v || v.trim() === '') ? '' : (!validateWard(v) ? 'Vui lòng chọn Phường/Xã hợp lệ' : '')}));
  };

  return (
    <>
      <Navbar />
      <div className="register-container" style={{background:'#f6fff8', minHeight:'100vh', paddingTop:40}}>
        <div className="register-box" style={{maxWidth:440, margin:'0 auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding:'32px 32px 24px 32px'}}>
          <h2 className="register-title" style={{textAlign:'center', fontWeight:700, fontSize:28, marginBottom:24}}>Tạo tài khoản</h2>
          <form className="register-form" onSubmit={handleSubmit} autoComplete="off">
            <div style={{display:'flex', gap:12, marginBottom:16}}>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Họ</label>
                <input type="text" placeholder="Nguyễn" name="lastName" autoComplete="off" required value={lastName} onChange={e => setLastName(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',marginBottom:0,background:'#fafafa'}} />
              </div>
              <div style={{flex:1}}>
                <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Tên</label>
                <input type="text" placeholder="Văn A" name="firstName" autoComplete="off" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',marginBottom:0,background:'#fafafa'}} />
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Email</label>
              <input type="email" placeholder="example@gmail.com" name="email" autoComplete="off" required value={email} onChange={e => handleEmailChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} />
              {emailError && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{emailError}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Số điện thoại</label>
              <input type="text" placeholder="0123456789" name="phoneNumber" autoComplete="off" value={phoneNumber} onChange={e => handlePhoneChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} />
              {phoneError && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{phoneError}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Số nhà</label>
              <input type="text" placeholder="12A" name="houseNumber" autoComplete="off" value={houseNumber} onChange={e => handleHouseNumberChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} />
              {addressErrors.houseNumber && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{addressErrors.houseNumber}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Tên đường</label>
              <input 
                type="text" 
                placeholder="Nguyễn Trãi" 
                name="street" 
                autoComplete="off" 
                value={street} 
                onChange={e => handleStreetChange(e.target.value)}
                list="street-suggestions"
                style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} 
              />
              <datalist id="street-suggestions">
                {commonStreets.map((streetName, idx) => (
                  <option key={streetName + idx} value={streetName} />
                ))}
              </datalist>
              {addressErrors.street && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{addressErrors.street}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Quận/Huyện</label>
              <select value={district} onChange={e => handleDistrictChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}}>
                <option value="">Chọn Quận/Huyện</option>
                {(districtData[province] || []).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {addressErrors.district && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{addressErrors.district}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Phường/Xã</label>
              <select value={ward} onChange={e => handleWardChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}}>
                <option value="">Chọn Phường/Xã</option>
                {(wardData[district] || []).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              {addressErrors.ward && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{addressErrors.ward}</div>}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Tỉnh/Thành</label>
              <input type="text" value={province} disabled style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#f3f4f6'}} />
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Mật khẩu</label>
              <input type="password" placeholder="Nhập mật khẩu" name="password" autoComplete="new-password" required value={password} onChange={e => handlePasswordChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} />
              {passwordError && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{passwordError}</div>}
            </div>
            <div style={{marginBottom:24}}>
              <label style={{fontWeight:600, marginBottom:4, display:'block'}}>Xác nhận mật khẩu</label>
              <input type="password" placeholder="Nhập lại mật khẩu" name="confirmPassword" autoComplete="new-password" required value={confirmPassword} onChange={e => handleConfirmPasswordChange(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ccc',background:'#fafafa'}} />
              {confirmPasswordError && <div style={{color:'#dc2626',fontSize:13,marginTop:2}}>{confirmPasswordError}</div>}
            </div>
            <button type="submit" className="register-btn" disabled={loading} style={{width:'100%',background:'#c92a15',color:'#fff',border:'none',borderRadius:8,padding:14,fontWeight:700,fontSize:18,boxShadow:'0 1px 4px rgba(201,42,21,0.08)',cursor:'pointer'}}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
          {message && <div className={`register-message ${message.includes('thành công') ? 'success' : 'error'}`} style={{marginTop:18, textAlign:'center', fontWeight:600, color: message.includes('thành công') ? '#166534' : '#dc2626'}}>{message}</div>}
        </div>
      </div>
    </>
  );
}
