import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { getAllDishes } from '../services/dish.api';
import type { Dish } from '../types/dish.type';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ModalConfirm } from '../../../../packages/react-web-ui-shadcn/src/components/modals/modal-confirm';

const CheckoutPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { orderItems, addToCart, removeFromCart } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState({
    open: false,
    item: null,
  });

  const navigate = useNavigate();
  useEffect(() => {
    let ignore = false;
    getAllDishes()
      .then((all) => {
        if (ignore) return;
        setDishes(all);
      });
    return () => {
      ignore = true;
    };
  }, []);
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90_000 },
    { value: 'large', price: 190_000 },
  ];
  const getDish = (dishId: string) => dishes.find((d) => d.id === dishId);
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    return price;
  };
  const decreaseQuantity = (item: any) => {
    if (item.quantity > 1) {
      addToCart(item.dishId, { quantity: -1, size: item.size, base: item.base, note: item.note });
    } else {
      removeFromCart({ dishId: item.dishId, size: item.size, base: item.base, note: item.note });
    }
  };
  const increaseQuantity = (item: any) => {
    addToCart(item.dishId, { quantity: 1, size: item.size, base: item.base, note: item.note });
  };
  const totalAmount = orderItems.reduce(
    (sum, item) => sum + getItemPrice(item) * (item.quantity || 1),
    0,
  );
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1000,
          margin: '0 auto',
          padding: '32px 16px',
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Sản phẩm</h2>
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 8px #0001',
            padding: 24,
            marginTop: 32,
          }}
        >
          {loading || (dishes.length === 0 && orderItems.length > 0) ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Đang tải...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#dc2626' }}>{error}</div>
          ) : orderItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Chưa có sản phẩm nào trong giỏ hàng.</div>
          ) : (
            <>
              <div>
                {orderItems.map((item, idx) => {
                  const dish = getDish(item.dishId);
                  if (!dish) return null;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
                      {/* Hình ảnh món */}
                      {dish?.imageUrl ? (
                        <img
                          src={dish.imageUrl}
                          alt={dish?.name || ''}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 12,
                            background: '#f5f5f5',
                            flexShrink: 0,
                          }}
                        />
                      ) : null}
                      {/* Thông tin món */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
                          {dish?.name || `Món: ${item.dishId}`}
                        </div>
                        {item.size && <div style={{ fontSize: 14 }}>Size: {item.size}</div>}
                        {item.base && <div style={{ fontSize: 14 }}>Đế: {item.base}</div>}
                        {item.note?.trim() && <div style={{ fontSize: 14 }}>Ghi chú: {item.note}</div>}
                      </div>
                      {/* Số lượng & giá */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        {/* Bộ đếm */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #ccc',
                            borderRadius: 12,
                            background: '#fff',
                            width: 120,
                            height: 40,
                            justifyContent: 'space-between',
                            padding: '0 8px',
                          }}
                        >
                          <button
                            type="button"
                            style={{
                              border: 'none',
                              background: 'none',
                              fontSize: 20,
                              fontWeight: 700,
                              color: item.quantity <= 1 ? '#bbb' : '#b45309',
                              cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              transition: 'color 0.2s',
                            }}
                            disabled={item.quantity <= 1}
                            onClick={() => decreaseQuantity(item)}
                          >
                            -
                          </button>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: 18,
                              width: 24,
                              textAlign: 'center',
                              userSelect: 'none',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            style={{
                              border: 'none',
                              background: 'none',
                              fontSize: 20,
                              fontWeight: 700,
                              color: '#b45309',
                              cursor: 'pointer',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              transition: 'color 0.2s',
                            }}
                            onClick={() => increaseQuantity(item)}
                          >
                            +
                          </button>
                        </div>
                        {/* Giá */}
                        <div style={{ minWidth: 110, textAlign: 'right', fontSize: 17, fontWeight: 600 }}>
                          {(getItemPrice(item) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                        </div>
                        {/* Xoá */}
                        <button
                          title="Xóa món này"
                          style={{
                            width: 36,
                            height: 36,
                            border: 'none',
                            background: 'none',
                            color: '#C92A15',
                            fontSize: 20,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          onClick={() => setConfirmRemove({ open: true, item })}
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Tổng tiền */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                <div style={{ fontWeight: 700, fontSize: 20 }}>
                  <span>Tổng tiền</span>
                  <span style={{ marginLeft: 16, color: '#b45309', fontWeight: 700, fontSize: 24 }}>{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
              {/* Nút hành động */}
              <div style={{ display: 'flex', gap: 16, marginTop: 36, justifyContent: 'center' }}>
                <button
                  style={{
                    background: '#fff',
                    color: '#b45309',
                    border: '1.5px solid #b45309',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    minWidth: 120,
                    transition: 'all 0.2s',
                    marginRight: 0,
                  }}
                  onClick={() => navigate(-1)}
                >
                  ← Quay lại
                </button>
                <button
                  onClick={() => navigate('/order-type')}
                  style={{
                    background: '#b45309',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 28px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                    minWidth: 120,
                    transition: 'all 0.2s',
                  }}
                >
                  Thanh toán
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Modal xác nhận xoá */}
      <ModalConfirm
        visible={confirmRemove.open}
        onYes={() => {
          if (confirmRemove.item) {
            removeFromCart(confirmRemove.item);
            setConfirmRemove({ open: false, item: null });
          }
        }}
        onNo={() => setConfirmRemove({ open: false, item: null })}
        title="Xác nhận xoá"
        message="Bạn có chắc chắn muốn xoá món này khỏi giỏ hàng?"
      />
    </div>
  );
};

export default CheckoutPage;
