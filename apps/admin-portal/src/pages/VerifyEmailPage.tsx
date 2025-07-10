import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const ICON_SUCCESS = (
  <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#16a34a"/>
    <path d="M34 18L21.5 30.5L14 23" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ICON_ERROR = (
  <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#dc2626"/>
    <path d="M30 18L18 30M18 18l12 12" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
const ICON_PENDING = (
  <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
    <circle cx="24" cy="24" r="24" fill="#b45309"/>
    <path d="M24 14v10l7 7" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Đang xác thực email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Thiếu mã xác thực.');
      return;
    }
    fetch(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus('success');
          setMessage(data?.message || 'Xác thực email thành công!');
          setTimeout(() => {
            window.location.href = 'http://localhost:3001/login';
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data?.message || 'Xác thực email thất bại.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Có lỗi xảy ra khi xác thực email.');
      });
  }, [searchParams]);

  let icon = ICON_PENDING;
  let title = 'Đang xác thực...';
  let color = '#b45309';
  if (status === 'success') {
    icon = ICON_SUCCESS;
    title = 'Xác thực thành công!';
    color = '#16a34a';
  } else if (status === 'error') {
    icon = ICON_ERROR;
    title = 'Lỗi xác thực';
    color = '#dc2626';
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px rgba(180,83,9,0.10)',
        padding: 36,
        maxWidth: 420,
        width: '90%',
        textAlign: 'center',
        border: `1.5px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ marginBottom: 16 }}>{icon}</div>
        <h2 style={{ color, fontWeight: 700, fontSize: 26, marginBottom: 12 }}>{title}</h2>
        <p style={{ marginBottom: 24, color: '#222', fontSize: 17 }}>{message}</p>
        {status === 'success' && <p style={{ color: '#666', fontSize: 15 }}>Bạn sẽ được chuyển về trang đăng nhập trong giây lát...</p>}
        {status === 'error' && <button onClick={() => window.location.href = 'http://localhost:3001/login'} style={{ background: '#b45309', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, fontSize: 16, cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px rgba(180,83,9,0.08)' }}>Về trang đăng nhập</button>}
      </div>
    </div>
  );
};

export default VerifyEmailPage; 