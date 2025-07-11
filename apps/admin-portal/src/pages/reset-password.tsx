import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/LoginPage.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPasswordPage() {
  const query = useQuery();
  const token = query.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      setMessage('Please enter all fields.');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('Failed to reset password.');
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">Reset Password</h2>
          <form className="login-form space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <div>
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                name="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                name="confirm"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          {message && (
            <div className={`login-message ${message.toLowerCase().includes('success') ? 'success' : 'error'}`}>{message}</div>
          )}
        </div>
      </div>
    </>
  );
} 