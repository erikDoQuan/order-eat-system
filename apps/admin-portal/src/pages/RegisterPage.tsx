import React, { useState } from 'react';

import { register } from '../services/user.api';

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
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className="mb-6 text-center text-3xl font-extrabold text-[#C92A15]">Tạo tài khoản</h2>
        <form className="space-y-5" onSubmit={handleSubmit} autoComplete="off">
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-black">Họ</label>
              <input
                type="text"
                placeholder="Nguyễn"
                name="lastName"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-black">Tên</label>
              <input
                type="text"
                placeholder="Văn A"
                name="firstName"
                autoComplete="off"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-black">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              name="email"
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black">Số điện thoại</label>
            <input
              type="text"
              placeholder="0123456789"
              name="phone"
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
              required
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black">Địa chỉ</label>
            <input
              type="text"
              placeholder="123 Đường ABC, Quận XYZ"
              name="address"
              autoComplete="off"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-black">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                name="password"
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-black">Xác nhận</label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                name="confirmPassword"
                autoComplete="new-password"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 text-black focus:border-[#C92A15] focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-[#C92A15] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#a01f10] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        {message && <div className="mt-4 text-center text-base font-semibold text-red-600">{message}</div>}
      </div>
    </div>
  );
}
