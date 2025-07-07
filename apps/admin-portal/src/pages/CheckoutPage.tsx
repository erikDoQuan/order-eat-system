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

  /* -------------------------------------------------- */
  /* Lấy danh sách món & topping                         */
  /* -------------------------------------------------- */
  useEffect(() => {
    let ignore = false;
    getAllDishes()
      .then((all) => {
        if (ignore) return;
        setDishes(all);

        // Tìm category topping
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

  /* -------------------------------------------------- */
  /* Tính giá & xử lý tăng/giảm                          */
  /* -------------------------------------------------- */
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

  /* -------------------------------------------------- */
  /* Render                                             */
  /* -------------------------------------------------- */
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />

      {/* Khung chính */}
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

        {/* Danh sách sản phẩm */}
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

                    {/* Thông tin món */}
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

                    {/* Số lượng & giá */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      {/* Bộ đếm */}
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
                          style={{
                            width: 36,
                            height: 36,
                            border: '1px solid #ccc',
                            borderRadius: 8,
                            background: '#fff',
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          disabled={item.quantity <= 1}
                          onClick={() => decreaseQuantity(item)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value < 1) {
                              removeFromCart({
                                dishId: item.dishId,
                                size: item.size,
                                base: item.base,
                                note: item.note,
                              });
                            } else {
                              addToCart(item.dishId, {
                                quantity: value - item.quantity,
                                size: item.size,
                                base: item.base,
                                note: item.note,
                              });
                            }
                          }}
                          style={{
                            width: 48,
                            textAlign: 'center',
                            fontWeight: 600,
                            fontSize: 18,
                            border: 'none',
                            outline: 'none',
                          }}
                        />
                        <button
                          type="button"
                          style={{
                            width: 36,
                            height: 36,
                            border: '1px solid #ccc',
                            borderRadius: 8,
                            background: '#fff',
                            fontSize: 22,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          onClick={() => increaseQuantity(item)}
                        >
                          +
                        </button>
                      </div>

                      {/* Giá */}
                      <div style={{ minWidth: 110, textAlign: 'right', fontSize: 17, fontWeight: 600 }}>
                        {dishes.length === 0
                          ? ''
                          : (getItemPrice(item) * item.quantity).toLocaleString('vi-VN') + '₫'}
                      </div>

                      {/* Xoá */}
                      <button
                        title="Xóa món này"
                        style={{
                          width: 36,
                          height: 36,
                          border: '1px solid #ccc',
                          borderRadius: 8,
                          background: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onClick={() => setConfirmRemove({ open: true, item })}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tổng tiền */}
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

            {/* Nút hành động */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <button
                style={{
                  background: '#6c8b7e',
                  color: '#fff',
                  padding: '8px 18px',
                  fontSize: 15,
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: 6,
                  height: 40,
                  minWidth: 140,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => navigate('/')}
              >
                ← Tiếp tục mua hàng
              </button>

              {/* Chuyển trang chọn hình thức đặt */}
              <button
                onClick={() => navigate('/order-type')} // 👉 chuyển thẳng sang OrderTypePage
                style={{
                  padding: '8px 24px',
                  borderRadius: 6,
                  background: '#16a34a',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  height: 40,
                  minWidth: 140,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                Thanh toán
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal xác nhận xoá */}
      <ModalConfirm
        visible={confirmRemove.open}
        title="Xác nhận xoá"
        message={`Bạn có chắc muốn xoá món '${
          getDish(confirmRemove.item?.dishId)?.name || ''
        }' khỏi giỏ hàng không?`}
        btnYes="Xoá"
        btnYesClassName="bg-[#dc2626] hover:bg-[#b91c1c] text-white border-none"
        btnNo="Huỷ"
        onYes={() => {
          if (confirmRemove.item) {
            removeFromCart({
              dishId: confirmRemove.item.dishId,
              size: confirmRemove.item.size,
              base: confirmRemove.item.base,
              note: confirmRemove.item.note,
            });
          }
          setConfirmRemove({ open: false, item: null });
        }}
        onNo={() => setConfirmRemove({ open: false, item: null })}
      />
    </div>
  );
};

export default CheckoutPage;
