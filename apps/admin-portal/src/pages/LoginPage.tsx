import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { adminLogin } from '../services/adminAuth.api';
import { login, sendForgotPasswordEmail } from '../services/auth.api';
import { fetchMe } from '../services/me.api';
import Navbar from '../components/Navbar';

import '../css/LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    try {
      await sendForgotPasswordEmail(forgotEmail);
      setForgotMessage('A reset password link has been sent to your email.');
      setTimeout(() => {
        setShowForgot(false);
        navigate('/reset-password?email=' + encodeURIComponent(forgotEmail));
      }, 2000);
    } catch (err: any) {
      setForgotMessage('Failed to send reset email. Please try again.');
    }
    setForgotLoading(false);
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
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <Link to="/forgot-password" className="forgot-link" style={{ color: '#007bff', textDecoration: 'underline', fontSize: 14 }}>
                Quên mật khẩu?
              </Link>
            </div>
          </form>
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 15 }}>
            Bạn chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: '#C92A15', textDecoration: 'underline', fontWeight: 500 }}>
              Tạo tài khoản
            </Link>
          </div>
          {message && (
            <div className={`login-message ${message.toLowerCase().includes('thành công') ? 'success' : 'error'}`}>{message}</div>
          )}
        </div>
      </div>
      {showForgot && (
        <div className="modal-forgot" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 8, minWidth: 320, position: 'relative' }}>
            <button onClick={() => setShowForgot(false)} style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            <h3 className="login-title" style={{ marginBottom: 16, color: '#C92A15' }}>Quên mật khẩu</h3>
            <form onSubmit={handleForgotSubmit} className="login-form space-y-5">
              <div>
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  className=""
                  placeholder="Nhập email của bạn"
                />
              </div>
              <button type="submit" className="login-btn" disabled={forgotLoading} style={{ borderRadius: 999 }}>
                {forgotLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
              </button>
            </form>
            {forgotMessage && <div className={`login-message ${forgotMessage.includes('sent') ? 'success' : 'error'}`}>{forgotMessage}</div>}
          </div>
        </div>
      )}
    </>
  );
}
