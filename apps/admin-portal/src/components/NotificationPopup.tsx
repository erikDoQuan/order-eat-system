import React from 'react';
import { CSSTransition } from 'react-transition-group';

import './NotificationPopup.css';

interface NotificationType {
  orderId: number | string;
  products: { name: string; quantity: number }[];
  date: string; // ISO string
  total: number;
  status: string;
}

interface NotificationPopupProps {
  notifications: NotificationType[];
  onClose: () => void;
  className?: string;
  loading?: boolean;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notifications, onClose, className, loading }) => {
  return (
    <CSSTransition in={true} appear timeout={300} classNames="notification-fade-slide" unmountOnExit>
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
          maxHeight: 420,
          overflowY: 'auto',
          margin: 0,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 18, color: '#b45309' }}>Thông báo đơn hàng</div>
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {loading ? (
            <div style={{ color: '#b45309', textAlign: 'center', padding: 32, fontWeight: 600 }}>Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Không có đơn hàng gần đây</div>
          ) : (
            notifications.map((notification, idx) => {
              const { orderId, products, date, total, status } = notification;
              const statusColor = status === 'Hoàn thành' || status === 'Đã xác nhận' ? '#16a34a' : '#b45309';
              return (
                <div
                  key={orderId}
                  style={{
                    background: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px #0001',
                    padding: 24,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: '#222' }}>Đơn hàng #{orderId}</div>
                  <div style={{ marginBottom: 8, color: '#444', fontSize: 16 }}>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {products.map((p, idx) => (
                        <li key={p.name} style={{ marginBottom: 2, listStyle: 'disc' }}>
                          <span>{p.name} </span>
                          <span style={{ color: '#b45309', fontWeight: 600 }}>x{p.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginBottom: 8, color: '#666', fontSize: 15 }}>Ngày đặt: {new Date(date).toLocaleDateString('vi-VN')}</div>
                  <div style={{ marginBottom: 8, color: '#C92A15', fontWeight: 600, fontSize: 17 }}>Tổng tiền: {total.toLocaleString('vi-VN')}₫</div>
                  <div style={{ marginBottom: 4, fontWeight: 700, fontSize: 16, color: statusColor }}>Trạng thái: {status}</div>
                </div>
              );
            })
          )}
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
    </CSSTransition>
  );
};

export default NotificationPopup;
