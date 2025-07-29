import React, { useContext, useEffect, useRef, useState } from 'react';
import { Edit, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { createUser, deleteUser, getAllUsers, updateUser, User as UserType } from '../services/user.api';

import '../css/AdminUserPage.css';

const AdminUserPage: React.FC = () => {
  const { user, setUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<UserType[]>([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [form, setForm] = useState<Partial<UserType> & { password?: string }>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const filteredUsers = users
    .filter(
      u =>
        (u.name || `${u.firstName || ''} ${u.lastName || ''}` || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      // Active lên trên, trong mỗi nhóm thì user mới nhất lên trên
      if ((b.isActive ? 1 : 0) !== (a.isActive ? 1 : 0)) {
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // const [totalUsers, setTotalUsers] = useState(0);
  // const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;
  if (!user || user.role !== 'admin') return null;

  // User dropdown logic
  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email;

  // User logic
  const fetchUsers = () => {
    setPageLoading(true);
    getAllUsers(1, 1000) // Lấy tất cả users để filter ở frontend
      .then(({ users }) => {
        setUsers(users || []);
      })
      .catch(() => setError('Không thể tải danh sách khách hàng'))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Reset về trang 1 khi search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleAdd = () => {
    setEditing(null);
    setForm({ isActive: true, role: 'user' });
    setShowForm(true);
  };

  const handleEdit = (u: UserType) => {
    setEditing(u);
    setForm({ ...u });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    setSaving(true);
    try {
      await deleteUser(id);
      fetchUsers();
    } catch {
      alert('Xóa thất bại');
    }
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Chỉ gửi các trường hợp lệ, ép kiểu cho đúng backend
      const payload: any = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        address: form.address,
        role: form.role === 'admin' ? 'admin' : 'user',
        isActive: form.isActive === false ? false : true,
      };
      if (editing) {
        delete payload.password; // Không gửi password khi update
        await updateUser(editing.id, payload);
      } else {
        if (!payload.email || !payload.password) throw new Error('Email và mật khẩu là bắt buộc');
        await createUser(payload);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err: any) {
      // Log lỗi chi tiết ra console
      console.error('Lỗi lưu user:', err?.response?.data || err);
      alert('Lưu thất bại: ' + (err?.response?.data?.message || err?.message || ''));
    }
    setSaving(false);
  };

  const newCustomerCount = users.filter(u => u.isActive !== false).length;

  return (
    <div className="admin-layout bg-gray-50">
      <div className="admin-sidebar-fixed">
        <AdminSidebar />
      </div>
      <div className="admin-main-content">
        {/* User info and dropdown */}
        <div className="relative mb-8 flex items-center justify-end gap-3">
          <div
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]"
            onClick={() => setShowMenu(v => !v)}
            ref={menuRef}
          >
            <UserIcon size={20} />
            {user && showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/admin/profile');
                  }}
                >
                  <UserIcon size={18} className="text-gray-500" />
                  Account
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                  <LogOut size={18} className="text-red-400" />
                  Logout
                </button>
              </div>
            )}
          </div>
          <span className="ml-2 text-base font-semibold text-black underline underline-offset-2 hover:text-blue-700" style={{ cursor: 'pointer' }}>
            {user?.firstName || ''} {user?.lastName || ''}
            {!(user?.firstName || user?.lastName) && user?.email}
          </span>
        </div>
        {/* User management content */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#C92A15]">User Management</h1>
          <button onClick={handleAdd} className="rounded-lg bg-[#C92A15] px-4 py-2 text-white shadow transition hover:bg-[#a81f0f]">
            + Add User
          </button>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset về trang 1 khi search
            }}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {pageLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!pageLoading && !error && (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table className="table-admin-user" style={{ minWidth: 1200 }}>
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="whitespace-nowrap border-b px-3 py-2">STT</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Email</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Name</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Phone</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Address</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Role</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Status</th>
                  <th className="whitespace-nowrap border-b px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, idx) => (
                  <tr key={u.id} className="transition hover:bg-gray-50">
                    <td className="border-b px-3 py-2 font-medium">{(currentPage - 1) * pageSize + idx + 1}</td>
                    <td className="border-b px-3 py-2">{u.email}</td>
                    <td className="border-b px-3 py-2">{u.name || [u.firstName, u.lastName].filter(Boolean).join(' ')}</td>
                    <td className="border-b px-3 py-2">{u.phoneNumber || '-'}</td>
                    <td className="border-b px-3 py-2">{u.address || '-'}</td>
                    <td className="border-b px-3 py-2">{u.role || '-'}</td>
                    <td className="border-b px-3 py-2">
                      <span
                        className={`inline-block whitespace-nowrap rounded px-2 py-1 text-xs font-semibold ${
                          u.isActive ? 'border border-green-200 bg-green-100 text-green-800' : 'border border-red-200 bg-red-100 text-red-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="border-b px-3 py-2">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <button onClick={() => handleEdit(u)} title="Edit" className="rounded p-2 text-blue-600 hover:bg-blue-100">
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={saving}
                          title="Delete"
                          className="rounded p-2 text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* PHÂN TRANG THÔNG MINH */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                {(() => {
                  const pages: React.ReactNode[] = [];

                  // Luôn hiển thị trang đầu
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className={`rounded border px-3 py-1 ${1 === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                    >
                      1
                    </button>,
                  );

                  // Hiển thị trang hiện tại và 2 trang xung quanh
                  const startPage = Math.max(2, currentPage - 1);
                  const endPage = Math.min(totalPages - 1, currentPage + 1);

                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis1" className="px-2">
                        ...
                      </span>,
                    );
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`rounded border px-3 py-1 ${i === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis2" className="px-2">
                        ...
                      </span>,
                    );
                  }

                  // Luôn hiển thị trang cuối
                  if (totalPages > 1) {
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className={`rounded border px-3 py-1 ${totalPages === currentPage ? 'bg-[#C92A15] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {totalPages}
                      </button>,
                    );
                  }

                  return pages;
                })()}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded border bg-gray-100 px-3 py-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        {showForm && (
          <div className="modal-admin">
            <div className="modal-content-admin">
              <button className="modal-close-admin" onClick={() => setShowForm(false)} type="button">
                ×
              </button>
              <h2 className="mb-4 text-lg font-semibold">{editing ? 'Edit User' : 'Add User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Email</label>
                  <input
                    value={form.email || ''}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    disabled={!!editing}
                  />
                </div>
                {!editing && (
                  <div className="mb-4">
                    <label className="mb-1 block font-medium">Password</label>
                    <input
                      value={form.password || ''}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      type="password"
                      className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Họ</label>
                  <input
                    value={form.firstName || ''}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Tên</label>
                  <input
                    value={form.lastName || ''}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Số điện thoại</label>
                  <input
                    value={form.phoneNumber || ''}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Địa chỉ</label>
                  <input
                    value={form.address || ''}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Role</label>
                  <select
                    value={form.role || 'user'}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="mb-1 block font-medium">Status</label>
                  <input
                    type="checkbox"
                    checked={form.isActive !== false}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span>{form.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded border border-gray-300 bg-gray-100 px-4 py-2 transition hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded bg-[#C92A15] px-4 py-2 text-white transition hover:bg-[#a81f0f] disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserPage;
