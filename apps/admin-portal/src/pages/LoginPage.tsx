import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { adminLogin } from '../services/adminAuth.api';
import { login } from '../services/auth.api';
import { fetchMe } from '../services/me.api';
import Navbar from '../components/Navbar';

import '../css/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // 1. Thử đăng nhập user trước
    const resultUser = await login(email, password);
    setLoading(false);
    if (resultUser && resultUser.success && resultUser.user) {
      setUser({
        id: resultUser.user.id,
        email: resultUser.user.email,
        firstName: resultUser.user.firstName,
        lastName: resultUser.user.lastName,
        phoneNumber: resultUser.user.phoneNumber || resultUser.user.phone_number,
        phone_number: resultUser.user.phone_number || resultUser.user.phoneNumber,
        address: resultUser.user.address,
        role: resultUser.user.role,
      });
      setMessage('Đăng nhập thành công!');
      if (resultUser.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        navigate('/', { replace: true });
      }
      return;
    }

    // 2. Nếu đăng nhập user thất bại, thử đăng nhập admin
    setLoading(true);
    const resultAdmin = await adminLogin({ email, password });
    setLoading(false);
    if (resultAdmin && resultAdmin.user && resultAdmin.user.role === 'admin') {
      setUser({
        id: resultAdmin.user.id,
        email: resultAdmin.user.email,
        firstName: resultAdmin.user.firstName,
        lastName: resultAdmin.user.lastName,
        phoneNumber: resultAdmin.user.phoneNumber || resultAdmin.user.phone_number,
        phone_number: resultAdmin.user.phone_number || resultAdmin.user.phoneNumber,
        role: resultAdmin.user.role,
      });
      setMessage('Đăng nhập admin thành công!');
      window.location.href = '/admin';
      return;
    }
    setMessage('Đăng nhập không thành công, hãy kiểm tra lại email hoặc mật khẩu');
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Đăng nhập</h2>
          <form className="login-form space-y-5" onSubmit={handleSubmit} autoComplete="off">
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
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          {message && (
            <div className={`login-message ${message.toLowerCase().includes('thành công') ? 'success' : 'error'}`}>{message}</div>
          )}
        </div>
      </div>
    </>
  );
}
