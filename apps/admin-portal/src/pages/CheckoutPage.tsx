import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getOrderItemsByUserId } from '../services/user.api';
import { getAllDishes } from '../services/dish.api';
import type { Dish } from '../types/dish.type';
import { FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CheckoutPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllDishes().then(setDishes).catch(() => setDishes([]));
  }, []);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getOrderItemsByUserId(user.id)
        .then(items => {
          setOrderItems(items);
          setError(null);
        })
        .catch(() => setError('Không lấy được dữ liệu giỏ hàng'))
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);

  const totalAmount = orderItems.reduce((sum, item) => {
    const dish = getDish(item.dishId);
    const unitPrice = dish?.basePrice ? Number(dish.basePrice) : 0;
    return sum + unitPrice * (item.quantity || 1);
  }, 0);

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1000,
          margin: '32px auto',
          padding: 32,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
          Sản phẩm
        </h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
            Đang tải...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'red' }}>{error}</div>
        ) : orderItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
            Chưa có món nào trong giỏ hàng
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              {orderItems.map((item, idx) => {
                const dish = getDish(item.dishId);
                const unitPrice = dish?.basePrice ? Number(dish.basePrice) : 0;
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      borderBottom: '1px solid #eee',
                      padding: '20px 0',
                      minHeight: 100,
                    }}
                  >
                    {dish?.imageUrl && (
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                        {dish?.name || `Món: ${item.dishId}`}
                      </div>
                      {dish?.description && (
                        <div
                          style={{
                            color: '#666',
                            fontSize: 14,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 520,
                            marginBottom: 2,
                          }}
                        >
                          {dish.description}
                        </div>
                      )}
                      {item.size && (
                        <div style={{ fontSize: 14 }}>Size: {item.size}</div>
                      )}
                      {item.base && (
                        <div style={{ fontSize: 14 }}>Đế: {item.base}</div>
                      )}
                      {item.note && item.note.trim() && (
                        <div style={{ fontSize: 14 }}>Ghi chú: {item.note}</div>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #ccc',
                          borderRadius: 8,
                        }}
                      >
                        <button
                          type="button"
                          style={{ width: 36, height: 36, border: '1px solid #ccc', borderRadius: 8, background: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                          disabled={item.quantity <= 0}
                        >
                          -
                        </button>
                        <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600, fontSize: 18 }}>{item.quantity}</span>
                        <button
                          type="button"
                          style={{ width: 36, height: 36, border: '1px solid #ccc', borderRadius: 8, background: '#fff', fontSize: 22, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          minWidth: 110,
                          textAlign: 'right',
                          fontSize: 17,
                          fontWeight: 600,
                        }}
                      >
                        {(unitPrice * item.quantity).toLocaleString('vi-VN')}₫
                      </div>
                      <button
                        type="button"
                        title="Xóa món này"
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          padding: 6,
                          borderRadius: 8,
                        }}
                      >
                        <FaTimes size={22} color="#C92A15" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                textAlign: 'right',
                fontSize: 22,
                fontWeight: 700,
                color: '#C92A15',
                marginBottom: 32,
              }}
            >
              Tổng tiền: {totalAmount.toLocaleString('vi-VN')}₫
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
              <button
                style={{
                  background: '#6c8b7e',
                  color: '#fff',
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                ← Tiếp tục mua hàng
              </button>
              <button
                style={{
                  background: '#0f693a',
                  color: '#fff',
                  padding: '12px 32px',
                  fontSize: 16,
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Thanh toán →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
