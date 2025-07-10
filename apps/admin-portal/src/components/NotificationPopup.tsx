import React from 'react';

interface NotificationPopupProps {
  notification: {
    orderId: number;
    products: { name: string; quantity: number }[];
    date: string; // ISO string
    total: number;
    status: 'Đã xác nhận' | 'Hoàn thành' | string;
  };
  onClose: () => void;
  className?: string;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose, className }) => {
  const { orderId, products, date, total, status } = notification;
  const statusColor = status === 'Hoàn thành' || status === 'Đã xác nhận' ? '#16a34a' : '#b45309';
  const boxBorder = status === 'Hoàn thành' || status === 'Đã xác nhận' ? '#16a34a' : '#b45309';
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 10,
        right: 0,
        width: 420,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px #0003',
        zIndex: 100,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 600,
        overflowY: 'auto',
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)',
        margin: 0,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 18, color: '#b45309' }}>Thông báo đơn hàng</div>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px #0001',
        padding: 24,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: '#222' }}>
          Đơn hàng #{orderId}
        </div>
        <div style={{ marginBottom: 8, color: '#444', fontSize: 16 }}>
          {products.map((p, idx) => (
            <span key={p.name}>
              {p.name} <span style={{ color: '#b45309', fontWeight: 600 }}>x{p.quantity}</span>{idx < products.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
        <div style={{ marginBottom: 8, color: '#666', fontSize: 15 }}>
          Ngày đặt: {new Date(date).toLocaleDateString('vi-VN')}
        </div>
        <div style={{ marginBottom: 8, color: '#C92A15', fontWeight: 600, fontSize: 17 }}>
          Tổng tiền: {total.toLocaleString('vi-VN')}₫
        </div>
        <div style={{ marginBottom: 4, fontWeight: 700, fontSize: 16, color: statusColor }}>
          Trạng thái: {status}
        </div>
      </div>
      <button
        type="button"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        style={{
          position: 'absolute',
          top: 8,
          right: 12,
          background: 'none',
          border: 'none',
          fontSize: 22,
          color: '#888',
          cursor: 'pointer',
        }}
        aria-label="Đóng thông báo"
      >
        &times;
      </button>
    </div>
  );
}; 