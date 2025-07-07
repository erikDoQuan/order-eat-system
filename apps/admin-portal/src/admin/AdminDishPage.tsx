import React, { useEffect, useState, useContext } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { getAllDishes, createDish, deleteDish, updateDish } from '../services/dish.api';
import { getAllCategories, Category } from '../services/category.api';
import '../css/AdminDishPage.css';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, User as UserType } from '../services/user.api';

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
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserType[]>([]);

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
    getAllUsers().then(setUsers);
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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
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
          <h1 className="text-2xl font-bold text-[#C92A15]">Quản lý món ăn</h1>
          <button
            onClick={handleAdd}
            className="bg-[#C92A15] text-white px-4 py-2 rounded-lg shadow hover:bg-[#a81f0f] transition"
          >
            + Thêm món ăn
          </button>
        </div>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
          />
        </div>
        {loading && <div>Đang tải...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="table-admin-dish">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="py-2 px-3 border-b">STT</th>
                  <th className="py-2 px-3 border-b">Tên món</th>
                  <th className="py-2 px-3 border-b">Giá</th>
                  <th className="py-2 px-3 border-b">Trạng thái</th>
                  <th className="py-2 px-3 border-b">Danh mục</th>
                  <th className="py-2 px-3 border-b">Loại</th>
                  <th className="py-2 px-3 border-b">Người tạo</th>
                  <th className="py-2 px-3 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {dishes.filter(dish => dish.name.toLowerCase().includes(search.toLowerCase())).map((dish, idx) => (
                  <tr key={dish.id} className="hover:bg-gray-50 transition">
                    <td className="py-2 px-3 border-b text-xs text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 border-b font-medium">{dish.name}</td>
                    <td className="py-2 px-3 border-b">{dish.basePrice !== undefined && !isNaN(Number(dish.basePrice)) ? Number(dish.basePrice).toLocaleString('vi-VN') : dish.basePrice}</td>
                    <td className="py-2 px-3 border-b flex justify-center items-center">
                      <span className={`badge-status ${dish.status === 'available' ? 'active' : 'inactive'}`}>{dish.status === 'available' ? 'Đang bán' : 'Ngừng bán'}</span>
                    </td>
                    <td className="py-2 px-3 border-b">{categories.find(c => c.id === dish.categoryId)?.name || '-'}</td>
                    <td className="py-2 px-3 border-b">{dish.typeName || '-'}</td>
                    <td className="py-2 px-3 border-b">{getUserName(dish.createdBy)}</td>
                    <td className="py-2 px-3 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          title="Sửa"
                          className="p-2 rounded hover:bg-blue-100 text-blue-600"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          disabled={saving}
                          title="Xóa"
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
              <h2 className="text-lg font-semibold mb-4">{editing ? 'Sửa món ăn' : 'Thêm món ăn'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Tên món</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Mô tả</label>
                  <input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Giá</label>
                  <input
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    required
                    type="number"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Trạng thái</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  >
                    <option value="available">Đang bán</option>
                    <option value="unavailable">Ngừng bán</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Danh mục</label>
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
                  <label className="block mb-1 font-medium">Ảnh (URL)</label>
                  <input
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                  />
                </div>
                {showSize && (
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">Kích cỡ</label>
                    <select
                      value={size}
                      onChange={e => setSize(e.target.value as any)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C92A15]"
                    >
                      <option value="">Chọn kích cỡ</option>
                      <option value="small">Nhỏ</option>
                      <option value="medium">Vừa</option>
                      <option value="large">Lớn</option>
                    </select>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block mb-1 font-medium">Loại (typeName)</label>
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
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-[#C92A15] text-white hover:bg-[#a81f0f] transition disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu'}
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

export default AdminDishPage; 