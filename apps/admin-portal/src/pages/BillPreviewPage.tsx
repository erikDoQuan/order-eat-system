import React, { useContext, useEffect, useRef, useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';

import logo from '../assets/images/logo.svg';
import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';

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
  const [adminInfo, setAdminInfo] = useState<{ name: string; email: string } | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const type = params.get('type');
  const paymentMethod = params.get('paymentMethod');

  useEffect(() => {
    // Ưu tiên lấy orderId từ query string nếu có
    const idFromQuery = params.get('orderId');
    if (idFromQuery) {
      setOrderId(idFromQuery);
      fetch(`/api/v1/orders/${idFromQuery}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.updatedByInfo) {
            setAdminInfo({
              name: data.updatedByInfo.name,
              email: data.updatedByInfo.email,
            });
          } else {
            setAdminInfo(null);
          }
        });
    } else {
      setAdminInfo(null);
    }
  }, []);

  // Sửa logic hiển thị phương thức thanh toán
  let paymentLabel = '-';
  if (paymentMethod === 'cash') paymentLabel = 'Thanh toán khi nhận hàng';
  else if (paymentMethod === 'zalopay') paymentLabel = 'Thanh toán bằng ZaloPay';
  else if (items.some(i => i.name && i.name.toLowerCase().includes('phí ship'))) paymentLabel = 'Tiền mặt';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f8f8' }}>
      <div className="hide-on-print" style={{ width: 260, background: '#fff', borderRight: '1px solid #eee' }}>
        <AdminSidebar />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div
          style={{
            maxWidth: 500,
            margin: '36px auto 0 auto',
            fontFamily: 'Arial',
            width: '100%',
            border: '1.5px solid #e0e0e0',
            borderRadius: 16,
            padding: '40px 32px',
            background: '#fff',
            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              src="/logo.png"
              alt="BẾP CỦA MẸ"
              style={{ height: 64, marginBottom: 8, objectFit: 'contain', display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
              onError={e => {
                (e.target as HTMLImageElement).src = '/logo.svg';
              }}
            />
            <div style={{ fontSize: 28, fontWeight: 700, color: '#C92A15', letterSpacing: 2, marginBottom: 8, fontFamily: 'Arial' }}>BẾP CỦA MẸ</div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <h1 style={{ color: '#222', fontSize: 22, margin: 0, textAlign: 'left', lineHeight: 1.1, fontFamily: 'Arial' }}>
              PHIẾU THANH TOÁN{orderNumber ? ` #${orderNumber}` : ''}
            </h1>
            <div style={{ textAlign: 'left', fontSize: 17, marginTop: 4, fontFamily: 'Arial' }}>
              Ngày lập: <b>{date}</b>
            </div>
          </div>
          <div style={{ margin: '24px 0 20px 0', fontFamily: 'Arial' }}>
            <div>
              <b>Hóa đơn cho:</b> {customer || ''}
            </div>
            <div>
              <b>Số điện thoại:</b> {customerPhone || ''}
            </div>
            <div>
              <b>Địa chỉ nhận:</b>{' '}
              {customerAddress === '01 Nguyễn Trãi, Phường Phước Hải, Nha Trang, Khánh Hòa'
                ? 'BẾP CỦA MẸ NGUYỄN TRÃI'
                : customerAddress === '296/29 Lương Định Của, Nha Trang, Khánh Hòa'
                  ? 'BẾP CỦA MẸ - TP NHA TRANG'
                  : customerAddress || ''}
            </div>
            <div>
              <b>Phương thức thanh toán:</b> {paymentLabel}
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24, fontFamily: 'Arial' }} border={1} cellPadding={8}>
            <thead>
              <tr style={{ background: '#FFE5D0' }}>
                <th style={{ textAlign: 'left', fontFamily: 'Arial' }}>Mô tả</th>
                <th style={{ textAlign: 'center', fontFamily: 'Arial' }}>Số lượng</th>
                <th style={{ textAlign: 'center', fontFamily: 'Arial' }}>Đơn giá</th>
                <th style={{ textAlign: 'center', fontFamily: 'Arial' }}>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} style={{ fontFamily: 'Arial' }}>
                  <td>{!item.name || item.name.toLowerCase() === 'món ăn' ? 'Không rõ tên món' : item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.quantity ?? 0}</td>
                  <td style={{ textAlign: 'center' }}>{formatVND(Number(item.price) || 0)}</td>
                  <td style={{ textAlign: 'center' }}>
                    {formatVND(
                      item.quantity === '' || Number(item.quantity) === 0
                        ? Number(item.price) || 0
                        : (Number(item.price) || 0) * (Number(item.quantity) || 0),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 20, color: '#C8403B', fontFamily: 'Arial' }}>
            Tổng cộng: {Number(totalAmount).toLocaleString()} VND
          </div>
          {/* Xóa dòng in đậm bên dưới tổng cộng */}
          {/* {paymentMethod === 'cash' && (
            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#000', marginTop: 8, textAlign: 'left' }}>
              <b>Tiền mặt:</b> {Number(totalAmount).toLocaleString()} VND
            </div>
          )}
          {paymentMethod === 'zalopay' && (
            <div style={{ fontWeight: 'bold', fontSize: 16, color: '#000', marginTop: 8, textAlign: 'left' }}>
              <b>Chuyển khoản (zalopay):</b> {Number(totalAmount).toLocaleString()} VND
            </div>
          )} */}
          <div style={{ textAlign: 'center', marginTop: 32, fontWeight: 500, fontSize: 16, color: '#333', letterSpacing: 1, fontFamily: 'Arial' }}>
            Cảm ơn Quý Khách & Hẹn gặp lại!
          </div>
        </div>
        <div className="hide-on-print" style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 500, margin: '8px auto 0 auto' }}>
          <button
            onClick={() => window.print()}
            style={{ padding: '8px 24px', fontSize: 16, background: '#C8403B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            In hóa đơn
          </button>
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
