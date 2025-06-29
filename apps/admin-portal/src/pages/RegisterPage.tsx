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
  const [address, setAddress] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    setMessage('');
    const res = await register(email, password, firstName, lastName, phoneNumber, address);
    setMessage(res.message);
    setLoading(false);
    if (res.success) {
      setUser({
        email,
        firstName,
        lastName,
        phoneNumber,
        role: 'user',
      });
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 800);
    }
  };

  return (
    <>
      <Navbar />
      <div className="register-container">
        <div className="register-box">
          <h2 className="register-title">Tạo tài khoản</h2>
          <form className="register-form space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label>Họ</label>
                <input
                  type="text"
                  placeholder="Nguyễn"
                  name="lastName"
                  autoComplete="off"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
              </div>
              <div className="w-1/2">
                <label>Tên</label>
                <input
                  type="text"
                  placeholder="Văn A"
                  name="firstName"
                  autoComplete="off"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                name="email"
                autoComplete="off"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input
                type="text"
                placeholder="0123456789"
                name="phoneNumber"
                autoComplete="off"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label>Địa chỉ</label>
              <input
                type="text"
                placeholder="123 Đường ABC, Quận 1"
                name="address"
                autoComplete="off"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <div>
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
          {message && <div className={`register-message ${message.includes('thành công') ? 'success' : 'error'}`}>{message}</div>}
        </div>
      </div>
    </>
  );
}
