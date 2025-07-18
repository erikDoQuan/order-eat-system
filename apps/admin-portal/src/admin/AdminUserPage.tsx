import React, { useContext, useEffect, useRef, useState } from 'react';
import { LogOut, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  User as UserType,
} from '../services/user.api';
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
  const page = 1;
  const pageSize = 1000;
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
    getAllUsers(page, pageSize, search)
      .then(({ users }) => {
        // Sắp xếp: active lên trên, sau đó theo createdAt mới nhất
        const sortedUsers = [...(users || [])].sort((a, b) => {
          if ((b.isActive ? 1 : 0) !== (a.isActive ? 1 : 0)) {
            return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        setUsers(sortedUsers);
      })
      .catch(() => setError('Không thể tải danh sách khách hàng'))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, pageSize, search]);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#C92A15]">User Management</h1>
          <button
            onClick={handleAdd}
            className="bg-[#C92A15] text-white px-4 py-2 rounded-lg shadow hover:bg-[#a81f0f] transition"
          >
            + Add User
          </button>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {pageLoading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!pageLoading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-user">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">STT</th>
                  <th className="py-2 px-3 border-b">Email</th>
                  <th className="py-2 px-3 border-b">Name</th>
                  <th className="py-2 px-3 border-b">SĐT</th>
                  <th className="py-2 px-3 border-b">Địa chỉ</th>
                  <th className="py-2 px-3 border-b">Role</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => (u.name || `${u.firstName || ''} ${u.lastName || ''}` || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase()))
                  .sort((a, b) => {
                    // Active lên trên, trong mỗi nhóm thì user mới nhất lên trên
                    if ((b.isActive ? 1 : 0) !== (a.isActive ? 1 : 0)) {
                      return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
                    }
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                  })
                  .map((u, idx) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 border-b font-medium">{u.email}</td>
                      <td className="py-2 px-3 border-b">{u.name || [u.firstName, u.lastName].filter(Boolean).join(' ')}</td>
                      <td className="py-2 px-3 border-b">{u.phoneNumber || '-'}</td>
                      <td className="py-2 px-3 border-b">{u.address || '-'}</td>
                      <td className="py-2 px-3 border-b">{u.role || '-'}</td>
                      <td className="py-2 px-3 border-b">
                        <span className={`badge-status ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="py-2 px-3 border-b">
                        <button className="mr-2 text-blue-600 hover:underline" onClick={() => handleEdit(u)}><Edit size={16} /></button>
                        <button className="text-red-600 hover:underline" onClick={() => handleDelete(u.id)}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* PHÂN TRANG DẠNG SỐ ĐƠN GIẢN */}
          </div>
        )}
        {showForm && (
          <div className="modal-admin">
            <div className="modal-content-admin">
              <button className="modal-close-admin" onClick={() => setShowForm(false)} type="button">×</button>
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit User' : 'Add User'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Email</label>
                  <input
                    value={form.email || ''}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    disabled={!!editing}
                  />
                </div>
                {!editing && (
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Password</label>
                    <input
                      value={form.password || ''}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      type="password"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
                  </div>
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Họ</label>
                  <input
                    value={form.firstName || ''}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Tên</label>
                  <input
                    value={form.lastName || ''}
                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Số điện thoại</label>
                  <input
                    value={form.phoneNumber || ''}
                    onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Địa chỉ</label>
                  <input
                    value={form.address || ''}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Role</label>
                  <select
                    value={form.role || 'user'}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Status</label>
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
                    className="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-[#C92A15] text-white hover:bg-[#a81f0f] transition disabled:opacity-50"
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