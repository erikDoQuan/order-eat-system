import React, { useContext, useEffect, useRef, useState } from 'react';
import { LogOut, User, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { getAllCategories, Category, createCategory, updateCategory, deleteCategory } from '../services/category.api';
import { getAllUsers, User as UserType } from '../services/user.api';
import '../css/AdminCategoryPage.css';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

const AdminCategoryPage: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [status, setStatus] = useState('active');
  const [isActive, setIsActive] = useState(true);
  const [search, setSearch] = useState('');

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

  // Category logic
  const fetchCategories = () => {
    setLoading(true);
    getAllCategories()
      .then(setCategories)
      .catch(() => setError('Không thể tải danh mục'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
    getAllUsers(1, 1000).then(res => setUsers(res.users || []));
  }, []);

  const handleAdd = () => {
    setEditing(null);
    setName('');
    setIsActive(true);
    setShowForm(true);
  };

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setIsActive(cat.isActive !== false);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    setSaving(true);
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch {
      alert('Xóa thất bại');
    }
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name, isActive });
      } else {
        if (!user?.id) throw new Error('Không xác định được người tạo');
        await createCategory({ name, createdBy: user.id, isActive: true });
      }
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      // Log lỗi chi tiết ra console
      console.error('Lỗi lưu danh mục:', err?.response?.data || err);
      alert('Lưu thất bại: ' + (err?.response?.data?.message || err?.message || ''));
    }
    setSaving(false);
  };

  const getUserName = (id?: string) => {
    if (!id) return '-';
    const user = users.find(u => u.id === id);
    if (user) {
      return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || user.id || '-';
    }
    // Nếu không tìm thấy user, fallback sang hiển thị id
    return id;
  };

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
            <User size={20} />
            {user && showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/admin/profile');
                  }}
                >
                  <User size={18} className="text-gray-500" />
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
        {/* Category management content */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#C92A15]">Category Management</h1>
          <button
            onClick={handleAdd}
            className="bg-[#C92A15] text-white px-4 py-2 rounded-lg shadow hover:bg-[#a81f0f] transition"
          >
            + Add Category
          </button>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-category">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">No.</th>
                  <th className="py-2 px-3 border-b">Category Name</th>
                  <th className="py-2 px-3 border-b">Active</th>
                  <th className="py-2 px-3 border-b">Created by</th>
                  <th className="py-2 px-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.filter(cat => cat.status !== 'inactive' && cat.name.toLowerCase().includes(search.toLowerCase())).map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 border-b font-medium">{cat.name}</td>
                    <td className="py-2 px-3 border-b">
                      <span className={`badge-status ${cat.isActive ? 'active' : 'inactive'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="py-2 px-3 border-b text-xs">{getUserName(cat.createdBy)}</td>
                    <td className="py-2 px-3 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          title="Edit"
                          className="p-2 rounded hover:bg-blue-100 text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={saving}
                          title="Delete"
                          className="p-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {showForm && (
          <div className="modal-admin">
            <div className="modal-content-admin">
              <button className="modal-close-admin" onClick={() => setShowForm(false)} type="button">×</button>
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Category Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Active</label>
                  <select
                    value={isActive ? 'active' : 'inactive'}
                    onChange={e => setIsActive(e.target.value === 'active')}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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

export default AdminCategoryPage;
