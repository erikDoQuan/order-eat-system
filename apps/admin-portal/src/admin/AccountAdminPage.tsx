import React, { useContext, useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

import '../css/AdminSidebar.css';

export default function AccountAdminPage() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState('---');

  useEffect(() => {
    setPhone(user?.phoneNumber || user?.phone_number || '---');
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="relative mb-8 flex items-center justify-end gap-3">
          <div className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]">
            <User size={20} />
          </div>
          <span className="ml-2 text-base font-semibold text-black underline underline-offset-2 hover:text-blue-700" style={{ cursor: 'pointer' }}>
            {user?.firstName || ''} {user?.lastName || ''}
            {!(user?.firstName || user?.lastName) && user?.email}
          </span>
        </div>
        <div className="mx-auto max-w-xl rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Thông tin tài khoản admin</h2>
          <div className="space-y-4">
            <div>
              <b>Họ và tên:</b>{' '}
              <span>
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div>
              <b>Email:</b> <span>{user?.email}</span>
            </div>
            <div>
              <b>Số điện thoại:</b> <span>{phone}</span>
            </div>
            <div>
              <b>Vai trò:</b> <span>{user?.role}</span>
            </div>
          </div>
          <button
            className="mt-8 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut size={18} className="text-white" /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
