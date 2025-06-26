import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import { login } from '../services/auth.api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'admin'>('user');

  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  // ✅ Auto navigate khi user thay đổi
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      setUser({
        email,
        role,
        firstName: result.firstName,
        lastName: result.lastName,
      });
    } else {
      setMessage(result.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-3xl font-bold text-primary">Đăng nhập</h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            <label>
              <input type="radio" name="role" value="user" checked={role === 'user'} onChange={() => setRole('user')} /> Người dùng
            </label>
            <label>
              <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} /> Quản trị viên
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        {message && <div className="mt-4 text-center text-base font-semibold text-primary">{message}</div>}
      </div>
    </div>
  );
}
