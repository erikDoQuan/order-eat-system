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
    let result = await adminLogin({ email, password });
    if (result && result.user && result.user.role === 'admin') {
      setUser({
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phoneNumber: result.user.phoneNumber || result.user.phone_number,
        phone_number: result.user.phone_number || result.user.phoneNumber,
        role: result.user.role,
      });
      setMessage('Đăng nhập admin thành công!');
      setLoading(false);
      navigate('/admin', { replace: true });
      return;
    }
    result = await login(email, password);
    setLoading(false);
    if (result && result.success && result.user) {
      // Gọi fetchMe để lấy thông tin user đầy đủ (bao gồm số điện thoại)
      const me = await fetchMe();
      if (me && me.email) {
        setUser({
          id: me.id,
          email: me.email,
          firstName: me.firstName,
          lastName: me.lastName,
          phoneNumber: me.phoneNumber,
          address: me.address,
          role: me.role,
        });
      }
      setMessage('Đăng nhập thành công!');
      navigate('/', { replace: true });
      return;
    }
    setMessage(result?.message || 'Đăng nhập thất bại');
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
          {message && <div className={`login-message ${message.includes('thành công') ? 'success' : 'error'}`}>{message}</div>}
        </div>
      </div>
    </>
  );
}
