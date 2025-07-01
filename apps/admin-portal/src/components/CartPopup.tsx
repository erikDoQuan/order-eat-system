import React from 'react';
import { useCart } from '../context/CartContext';

export const CartPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { cart, removeFromCart } = useCart();
  const items = cart?.orderItems.items || [];
  return (
    <div style={{ position: 'absolute', top: 50, right: 0, width: 380, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px #0002', zIndex: 100, padding: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>Giỏ hàng</div>
      {items.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Chưa có món nào trong giỏ hàng</div>
      ) : (
        <>
          {items.map(item => (
            <div key={item.dishId} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Món: {item.dishId}</div>
                <div style={{ color: '#666', fontSize: 15 }}>Số lượng: {item.quantity}</div>
              </div>
              <button onClick={() => removeFromCart(item.dishId)} style={{ background: 'none', border: 'none', color: '#C92A15', fontSize: 18, cursor: 'pointer' }}>🗑</button>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 17 }}>
            <span>Tổng tiền</span>
            <span style={{ color: '#C92A15' }}>{cart?.totalAmount?.toLocaleString('vi-VN')}đ</span>
          </div>
          <button style={{ width: '100%', background: '#17823c', color: 'white', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, marginTop: 16, cursor: 'pointer' }}>Thanh toán</button>
        </>
      )}
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
    </div>
  );
}; 