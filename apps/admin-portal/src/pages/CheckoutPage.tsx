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
  const [toppingDishes, setToppingDishes] = useState<Dish[]>([]);
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; item: any | null }>({
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
        fetch('/api/v1/categories')
          .then((res) => res.json())
          .then((catRes) => {
            if (ignore) return;
            const categories = catRes.data || [];
            const toppingCat = categories.find((c: any) =>
              (c.nameLocalized || c.name)?.toLowerCase().includes('topping'),
            );
            if (toppingCat) setToppingDishes(all.filter((d) => d.categoryId === toppingCat.id));
          });
      })
      .catch(() => {
        if (!ignore) setDishes([]);
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
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      const topping = toppingDishes.find((t) => t.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
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
          margin: '32px auto',
          padding: 32,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Sản phẩm</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Đang tải...</div>
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
                      {item.size && <div style={{ fontSize: 14 }}>Size: {item.size}</div>}
                      {item.base && (
                        <div style={{ fontSize: 14 }}>
                          Đế:{' '}
                          {['dày', 'mỏng'].includes(item.base)
                            ? item.base.charAt(0).toUpperCase() + item.base.slice(1)
                            : dishes.find((d) => d.id === item.base)?.name || item.base}
                        </div>
                      )}
                      {item.note?.trim() && <div style={{ fontSize: 14 }}>Ghi chú: {item.note}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #ccc',
                          borderRadius: 8,
                        }}
                      >
                        <button
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: 20,
                            padding: '0 8px',
                            cursor: 'pointer',
                            color: '#C92A15',
                          }}
                          onClick={() => decreaseQuantity(item)}
                        >
                          -
                        </button>
                        <span style={{ padding: '0 8px', fontWeight: 600 }}>{item.quantity}</span>
                        <button
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: 20,
                            padding: '0 8px',
                            cursor: 'pointer',
                            color: '#C92A15',
                          }}
                          onClick={() => increaseQuantity(item)}
                        >
                          +
                        </button>
                      </div>
                      <div style={{ minWidth: 110, textAlign: 'right', fontSize: 17, fontWeight: 600 }}>
                        {(getItemPrice(item) * (item.quantity || 1)).toLocaleString('vi-VN')}₫
                      </div>
                      <button
                        style={{
                          border: 'none',
                          background: 'none',
                          color: '#C92A15',
                          fontSize: 20,
                          cursor: 'pointer',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 20, marginTop: 32 }}>
              <span>Tổng tiền</span>
              <span style={{ color: 'red', fontWeight: 700, fontSize: 22 }}>{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 36, justifyContent: 'center' }}>
              <button
                style={{ background: '#fff', color: '#C92A15', border: '1.5px solid #C92A15', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', minWidth: 120, transition: 'all 0.2s', marginRight: 0 }}
                onClick={() => navigate(-1)}
              >
                ← Quay lại
              </button>
              <button
                style={{ background: '#C92A15', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 16, fontWeight: 600, cursor: 'pointer', minWidth: 120, transition: 'all 0.2s' }}
                onClick={() => navigate('/order-type')}
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>
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
