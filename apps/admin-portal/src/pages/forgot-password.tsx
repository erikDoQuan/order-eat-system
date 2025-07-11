import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Đã gửi liên kết đặt lại mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư!');
      } else {
        setMessage(data.message || 'Gửi liên kết thất bại.');
      }
    } catch (err) {
      setMessage('Gửi liên kết thất bại.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Quên mật khẩu</h2>
          <form className="login-form space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                name="email"
                autoComplete="off"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading} style={{ borderRadius: 999 }}>
              {loading ? 'Đang gửi...' : 'Gửi liên kết đặt lại mật khẩu'}
            </button>
          </form>
          {message && (
            <div className={`login-message ${message.includes('Đã gửi') ? 'success' : 'error'}`}>{message}</div>
          )}
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button type="button" style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', fontSize: 15 }} onClick={() => navigate('/login')}>
              Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 