import React from 'react';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

export const CartIcon: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const { cart } = useCart();
  const totalQty = cart?.orderItems.items.reduce((sum, i) => sum + i.quantity, 0) || 0;
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white',
        border: '2px solid #C92A15',
        borderRadius: '50%',
        width: 32,
        height: 28,
        padding: 0,
        boxSizing: 'border-box',
      }}>
        <FaShoppingCart size={18} color="#C92A15" />
      </div>
      {totalQty > 0 && (
        <span style={{
          position: 'absolute',
          top: -6,
          right: -8,
          background: '#C92A15',
          color: 'white',
          borderRadius: '50%',
          minWidth: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          padding: '0 6px',
          border: '2px solid #fff',
        }}>{totalQty}</span>
      )}
    </div>
  );
}; 