import React, { useEffect, useState, useContext } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { getAllDishes, createDish, deleteDish, updateDish } from '../services/dish.api';
import { getAllCategories, Category } from '../services/category.api';
import '../css/AdminDishPage.css';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, User as UserType } from '../services/user.api';
import axios from 'axios';

type AdminDishPageProps = { showAddForm?: boolean };
const AdminDishPage: React.FC<AdminDishPageProps> = ({ showAddForm }) => {
  const [dishes, setDishes] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [status, setStatus] = useState('available');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [size, setSize] = useState<'small' | 'medium' | 'large' | ''>('');
  const [typeName, setTypeName] = useState('');
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return null;
  if (!user || user.role !== 'admin') return null;

  const fetchDishes = () => {
    setLoading(true);
    getAllDishes()
      .then(setDishes)
      .catch(() => setError('Không thể tải danh sách món ăn'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDishes();
    getAllCategories().then(setCategories);
    getAllUsers(1, 1000).then(res => setUsers(res.users));
  }, []);

  useEffect(() => {
    if (showAddForm) {
      setEditing(null);
      setName('');
      setDescription('');
      setBasePrice('');
      setStatus('available');
      setCategoryId(categories[0]?.id || '');
      setImageUrl('');
      setSize('');
      setTypeName('');
      setShowForm(true);
    }
  }, [showAddForm, categories]);

  const handleAdd = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setStatus('available');
    setCategoryId(categories[0]?.id || '');
    setImageUrl('');
    setSize('');
    setTypeName('');
    setShowForm(true);
  };

  const handleEdit = (dish: any) => {
    setEditing(dish);
    setName(dish.name);
    setDescription(dish.description || '');
    setBasePrice(dish.basePrice || '');
    setStatus(dish.status || 'available');
    setCategoryId(dish.categoryId || categories[0]?.id || '');
    setImageUrl(dish.imageUrl || '');
    setSize(dish.size || '');
    setTypeName(dish.typeName || '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    setSaving(true);
    try {
      await deleteDish(id);
      fetchDishes();
    } catch {
      alert('Xóa thất bại');
    }
    setSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dishData: any = { name, description, basePrice, status, categoryId, imageUrl, typeName };
      if (showSize) dishData.size = size;
      if (editing) {
        if (!user?.id) throw new Error('Không xác định được người cập nhật');
        dishData.updatedBy = user.id;
        await updateDish(editing.id, dishData);
      } else {
        if (!user?.id) throw new Error('Không xác định được người tạo');
        dishData.createdBy = user.id;
        dishData.updatedBy = user.id;
        await createDish(dishData);
      }
      setShowForm(false);
      fetchDishes();
    } catch (err: any) {
      const errorData = err?.response?.data;
      console.error('Lỗi lưu món ăn:', errorData || err);
      let message = 'Lưu thất bại';
      if (Array.isArray(errorData?.message)) {
        if (typeof errorData.message[0] === 'object') {
          message += ': ' + errorData.message.map((m: any) => m.message || JSON.stringify(m)).join(', ');
        } else {
          message += ': ' + errorData.message.join(', ');
        }
      } else if (typeof errorData?.message === 'string') {
        message += ': ' + errorData.message;
      } else if (errorData?.message) {
        message += ': ' + JSON.stringify(errorData.message);
      } else if (err?.message) {
        message += ': ' + err.message;
      }
      alert(message);
    }
    setSaving(false);
  };

  const selectedCategory = categories.find(c => c.id === categoryId);
  const showSize = selectedCategory && selectedCategory.name.toLowerCase().includes('pizza') && !selectedCategory.name.toLowerCase().includes('mỳ ý') && !selectedCategory.name.toLowerCase().includes('gà');

  // User dropdown logic
  const handleLogout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const displayName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.email;

  const getUserName = (id?: string) => {
    const user = users.find(u => u.id === id);
    if (!user) return '-';
    return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email || '-';
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
                  Tài khoản
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={handleLogout}>
                  <LogOut size={18} className="text-red-400" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          <span className="ml-2 text-base font-semibold text-black underline underline-offset-2 hover:text-blue-700" style={{ cursor: 'pointer' }}>
            {user?.firstName || ''} {user?.lastName || ''}
            {!(user?.firstName || user?.lastName) && user?.email}
          </span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#C92A15]">Dish Management</h1>
          <button
            onClick={handleAdd}
            className="bg-[#C92A15] text-white px-4 py-2 rounded-lg shadow hover:bg-[#a81f0f] transition"
          >
            + Add Dish
          </button>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Search dish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-dish">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">No.</th>
                  <th className="py-2 px-3 border-b">Dish Name</th>
                  <th className="py-2 px-3 border-b">Price</th>
                  <th className="py-2 px-3 border-b">Status</th>
                  <th className="py-2 px-3 border-b">Category</th>
                  <th className="py-2 px-3 border-b">Type</th>
                  <th className="py-2 px-3 border-b">Created by</th>
                  <th className="py-2 px-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody>
                {dishes.filter(dish => dish.name.toLowerCase().includes(search.toLowerCase())).map((dish, idx) => (
                  <tr key={dish.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 border-b font-medium">{dish.name}</td>
                    <td className="py-2 px-3 border-b">{dish.basePrice !== undefined && !isNaN(Number(dish.basePrice)) ? Number(dish.basePrice).toLocaleString('vi-VN') : dish.basePrice}</td>
                    <td className="py-2 px-3 border-b flex justify-center items-center">
                      <span className={`badge-status ${dish.status === 'available' ? 'active' : 'inactive'}`}>{dish.status === 'available' ? 'Available' : 'Unavailable'}</span>
                    </td>
                    <td className="py-2 px-3 border-b">{categories.find(c => c.id === dish.categoryId)?.name || '-'}</td>
                    <td className="py-2 px-3 border-b">{dish.typeName || '-'}</td>
                    <td className="py-2 px-3 border-b">{getUserName(dish.createdBy)}</td>
                    <td className="py-2 px-3 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          title="Edit"
                          className="p-2 rounded hover:bg-blue-100 text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
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
          <div
            className="modal-admin"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.2)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              className="modal-content-admin"
              style={{
                background: '#fff',
                borderRadius: 16,
                maxWidth: 420,
                width: '100%',
                maxHeight: '80vh',
                boxShadow: '0 8px 32px #0002',
                padding: 24,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              <button
                className="modal-close-admin"
                onClick={() => setShowForm(false)}
                type="button"
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 16,
                  zIndex: 2,
                  background: 'none',
                  border: 'none',
                  fontSize: 28,
                  color: '#888',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Đóng"
              >
                ×
              </button>
              <div
                style={{
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: 0,
                  paddingRight: 8,
                  maxHeight: '70vh',
                }}
              >
                <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit Dish' : 'Add Dish'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Dish Name</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Description</label>
                    <input
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Price</label>
                    <input
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                      required
                      type="number"
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Status</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Category</label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    >
                      {categories.filter(cat => cat.isActive !== false).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('files', file);
                          try {
                            const res = await axios.post('/api/v1/files/upload', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' },
                            });
                            const data = res.data;
                            if (Array.isArray(data) && data[0]?.uniqueName) {
                              setImageUrl(data[0].uniqueName);
                            } else if (data?.data && Array.isArray(data.data) && data.data[0]?.uniqueName) {
                              setImageUrl(data.data[0].uniqueName);
                            } else {
                              alert('Upload failed!');
                            }
                          } catch (err) {
                            alert('Upload failed!');
                          }
                        }
                      }}
                    />
                    {imageUrl && (
                      <div className="mt-2">
                        <img
                          src={`/api/v1/files/public/${imageUrl}`}
                          alt="Preview"
                          style={{ maxWidth: 180, maxHeight: 180, borderRadius: 8, border: '1px solid #eee' }}
                        />
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          Ảnh hiện tại: {imageUrl}
                        </div>
                      </div>
                    )}
                  </div>
                  {showSize && (
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">Size</label>
                      <select
                        value={size}
                        onChange={e => setSize(e.target.value as any)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                      >
                        <option value="">Select size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Type (typeName)</label>
                    <input
                      value={typeName}
                      onChange={e => setTypeName(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    />
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDishPage; 