import React, { useContext, useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

import '../css/AdminSidebar.css';

export default function AccountAdminPage() {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(false);
  const [phone, setPhone] = useState('---');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  useEffect(() => {
    setPhone(user?.phoneNumber || user?.phone_number || '---');
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
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
          <h2 className="mb-6 text-xl font-bold text-gray-900">Admin Account Information</h2>
          <div className="space-y-4">
            <div>
              <b>Full Name:</b>{' '}
              <span>
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <div>
              <b>Email:</b> <span>{user?.email}</span>
            </div>
            <div>
              <b>Phone Number:</b> <span>{phone}</span>
            </div>
            <div>
              <b>Role:</b> <span>{user?.role}</span>
            </div>
          </div>
          <button
            className="mt-8 flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={handleLogout}
          >
            <LogOut size={18} className="text-white" /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
