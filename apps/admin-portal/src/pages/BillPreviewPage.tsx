import React, { useContext, useRef, useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, LogOut } from 'lucide-react';

// Thêm CSS ẩn khi in
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `@media print { .hide-on-print { display: none !important; } body { background: #fff !important; } }`;
  document.head.appendChild(style);
}

export default function BillPreviewPage() {
  const { user, setUser } = useContext(AuthContext);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(window.location.search);
  const customer = params.get('customer');
  let items: any[] = [];
  try {
    items = JSON.parse(decodeURIComponent(params.get('items') || '[]'));
  } catch (e) {}
  const total = Number(params.get('total'));
  const totalAmount = Number(params.get('total_amount')) || total;
  const customerAddress = params.get('customerAddress');
  const customerPhone = params.get('customerPhone');
  const date = params.get('date');
  const orderNumber = params.get('order_number');
  const adminName = params.get('adminName');
  const adminEmail = params.get('adminEmail');
  const adminId = params.get('adminId');
  const [adminInfo, setAdminInfo] = useState<{name: string, email: string} | null>(null);
  useEffect(() => {
    if (adminId) {
      fetch(`/api/v1/users/${adminId}`)
        .then(res => res.json())
        .then(data => {
          if (data && (data.firstName || data.lastName || data.email)) {
            setAdminInfo({
              name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || data.id,
              email: data.email || '',
            });
          }
        });
    }
  }, [adminId]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      <div className="hide-on-print" style={{ width: 260, background: '#fff', borderRight: '1px solid #eee' }}>
        <AdminSidebar />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="hide-on-print relative mb-8 flex items-center justify-end gap-3" style={{padding: '24px 32px 0 0', minHeight: 60}}>
          <div
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#C92A15] bg-[#e6f4ed] text-[#C92A15]"
            onClick={() => setShowMenu(v => !v)}
            ref={menuRef}
          >
            <UserIcon size={20} />
            {/* Dropdown menu nếu cần */}
            {/*
            {user && showMenu && (
              <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border bg-white py-2 shadow-xl">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setShowMenu(false);
                    // navigate('/admin/profile');
                  }}
                >
                  <UserIcon size={18} className="text-gray-500" />
                  Tài khoản
                </button>
                <button className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100" onClick={() => { setUser(null); window.location.href = '/login'; }}>
                  <LogOut size={18} className="text-red-400" />
                  Đăng xuất
                </button>
              </div>
            )}
            */}
          </div>
          <span className="ml-2 text-base font-semibold text-black underline underline-offset-2 hover:text-blue-700" style={{ cursor: 'pointer' }}>
            {user?.firstName || ''} {user?.lastName || ''}
            {!(user?.firstName || user?.lastName) && user?.email}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', flex: 1 }}>
          <div style={{ maxWidth: 700, margin: '40px auto', fontFamily: 'Arial', background: '#f8f8f8', padding: 32, borderRadius: 12, width: '100%' }}>
            <h1 style={{ color: '#1a936f', fontSize: 36, marginBottom: 8 }}>HÓA ĐƠN{orderNumber ? ` #${orderNumber}` : ''}</h1>
            <div>Ngày lập: <b>{date}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '24px 0' }}>
              <div>
                <b>Hóa đơn cho:</b><br />
                {customer}<br />
                {customerAddress}<br />
                {customerPhone && <>{customerPhone}<br /></>}
              </div>
              <div>
                <b>Thanh toán cho:</b><br />
                {adminInfo?.name || '---'}<br />
                {adminInfo?.email || '---'}<br />
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }} border={1} cellPadding={8}>
              <thead>
                <tr style={{ background: '#e0f2f1' }}>
                  <th style={{ textAlign: 'left' }}>Mô tả</th>
                  <th style={{ textAlign: 'center' }}>Số lượng</th>
                  <th style={{ textAlign: 'center' }}>Đơn giá</th>
                  <th style={{ textAlign: 'center' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{!item.name || item.name.toLowerCase() === 'món ăn' ? 'Không rõ tên món' : item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity ?? 0}</td>
                    <td style={{ textAlign: 'center' }}>{formatVND(Number(item.price) || 0)}</td>
                    <td style={{ textAlign: 'center' }}>{formatVND((item.quantity === '' || Number(item.quantity) === 0) ? (Number(item.price) || 0) : (Number(item.price) || 0) * (Number(item.quantity) || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 20, color: '#1a936f' }}>
              Tổng cộng: {Number(totalAmount).toLocaleString()} VND
            </div>
            <div style={{ marginTop: 32, color: '#888', fontSize: 14 }}>
              <b>An Nam</b> | Chữ ký lãnh bút ở đây.
            </div>
            <button onClick={() => window.print()} style={{ marginTop: 24, padding: '8px 24px', fontSize: 16, background: '#1a936f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
              In hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatVND(value: number) {
  if (value >= 1000000) {
    return (value / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' triệu VND';
  }
  return Number(value).toLocaleString('vi-VN') + ' VND';
} 