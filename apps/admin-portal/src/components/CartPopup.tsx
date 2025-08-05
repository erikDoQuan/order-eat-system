import React, { useContext, useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { Dish } from '../types/dish.type';
import { ModalConfirm } from '../../../../packages/react-web-ui-shadcn/src/components/modals/modal-confirm';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDishes } from '../context/DishContext';

export const CartPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { orderItems, removeFromCart, addToCart } = useCart();
  const dishes = useDishes();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });
  const CACHE_DURATION = 2 * 60 * 1000; // 2 phút

  // Hàm lấy phụ phí size
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  // Lấy danh sách topping (dishes có category là topping)
  const [toppingDishes, setToppingDishes] = useState<Dish[]>([]);

  // Force update khi orderItems thay đổi để đảm bảo re-render
  // Xoá toàn bộ useEffect setDishes khi orderItems thay đổi

  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getImageUrl = (imageUrl: string | undefined | null) => {
    if (!imageUrl) return '/default-image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL}/api/v1/files/public/${imageUrl}`;
  };

  // Hàm tính giá đúng cho từng item
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find(s => s.value === item.size)?.price || 0;
    }
    if (item.base && item.base !== 'dày' && item.base !== 'mỏng') {
      const topping = dishes.find(d => d.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
    }
    return price;
  };

  // Tính tổng tiền đúng
  const totalAmount = orderItems.reduce((sum, item) => {
    return sum + getItemPrice(item) * (item.quantity || 1);
  }, 0);

  // Hàm tăng/giảm số lượng
  const decreaseQuantity = async (item: any) => {
    if (item.quantity > 1) {
      await addToCart(item.dishId, {
        quantity: -1,
        size: item.size,
        base: item.base,
        note: item.note,
      });
    }
  };

  const increaseQuantity = async (item: any) => {
    await addToCart(item.dishId, {
      quantity: 1,
      size: item.size,
      base: item.base,
      note: item.note,
    });
  };

  // Xử lý xóa item khỏi cart hiện tại, cập nhật UI trước, đồng bộ localStorage qua context
  const handleRemove = async (itemToRemove: any) => {
    const dish = getDish(itemToRemove.dishId);
    const confirmMsg = `Bạn có chắc muốn xóa món '${dish ? dish.name : itemToRemove.dishId}' khỏi giỏ hàng không?`;
    if (!window.confirm(confirmMsg)) return;
    await removeFromCart({
      dishId: itemToRemove.dishId,
      size: itemToRemove.size,
      base: itemToRemove.base,
      note: itemToRemove.note,
    });
    // Đóng popup nếu hết hàng
    if (orderItems.length === 1) onClose();
  };

  return (
    <div
      className="cart-popup-modal"
      onClick={e => e.stopPropagation()}
      style={{
        position: 'absolute',
        top: window.innerWidth <= 768 ? 40 : 35,
        right: window.innerWidth <= 768 ? '50%' : 0,
        transform: window.innerWidth <= 768 ? 'translateX(50%)' : 'none',
        width: window.innerWidth <= 768 ? 'calc(100vw - 32px)' : 420,
        maxWidth: window.innerWidth <= 768 ? 'calc(100vw - 32px)' : 420,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 32px #0003',
        zIndex: 101,
        padding: window.innerWidth <= 768 ? 16 : 32,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: window.innerWidth <= 768 ? 'calc(100vh - 100px)' : 600,
      }}
    >
      <div style={{ fontWeight: 800, fontSize: window.innerWidth <= 768 ? 18 : 22, marginBottom: window.innerWidth <= 768 ? 12 : 18 }}>Giỏ hàng</div>
      {loading || (dishes.length === 0 && orderItems.length > 0) ? (
        <div style={{ color: '#888', textAlign: 'center', padding: window.innerWidth <= 768 ? 16 : 32 }}>Đang tải...</div>
      ) : orderItems.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: window.innerWidth <= 768 ? 16 : 32 }}>Chưa có món nào trong giỏ hàng</div>
      ) : (
        <>
          <div
            className="cart-popup-content"
            style={{ flex: 1, maxHeight: window.innerWidth <= 768 ? 240 : 320, overflowY: 'auto', marginBottom: window.innerWidth <= 768 ? 8 : 12 }}
          >
            {orderItems.map((item, idx) => {
              const dish = getDish(item.dishId);
              if (!dish) return null;
              return (
                <div
                  key={`${item.dishId}-${item.size || ''}-${item.base || ''}-${item.note || ''}-${idx}`}
                  style={{ display: 'flex', alignItems: 'center', marginBottom: window.innerWidth <= 768 ? 10 : 14 }}
                >
                  {dish.imageUrl && (
                    <img
                      src={getImageUrl(dish.imageUrl)}
                      alt={dish.name}
                      style={{
                        width: window.innerWidth <= 768 ? 48 : 56,
                        height: window.innerWidth <= 768 ? 48 : 56,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginRight: window.innerWidth <= 768 ? 8 : 12,
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: window.innerWidth <= 768 ? 14 : 16 }}>{dish.name}</div>
                    {dish.description && <div style={{ color: '#666', fontSize: window.innerWidth <= 768 ? 12 : 14 }}>{dish.description}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: window.innerWidth <= 768 ? 6 : 8, marginTop: 4 }}>
                      <span style={{ color: '#666', fontSize: window.innerWidth <= 768 ? 12 : 14 }}>Số lượng:</span>
                      {/* Bộ đếm số lượng */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #ddd',
                          borderRadius: 6,
                          background: '#fff',
                          width: 80,
                          height: 28,
                          justifyContent: 'space-between',
                          padding: '0 4px',
                        }}
                      >
                        <button
                          type="button"
                          style={{
                            border: 'none',
                            background: 'none',
                            fontSize: 14,
                            fontWeight: 700,
                            color: item.quantity <= 1 ? '#bbb' : '#C92A15',
                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 3,
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
                            fontSize: 12,
                            width: 16,
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
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#C92A15',
                            cursor: 'pointer',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 3,
                            transition: 'color 0.2s',
                          }}
                          onClick={() => increaseQuantity(item)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {item.size && <div style={{ color: '#666', fontSize: 14 }}>Size: {item.size}</div>}
                    {item.base && (
                      <div style={{ color: '#666', fontSize: 14 }}>
                        Đế:{' '}
                        {item.base === 'dày' || item.base === 'mỏng'
                          ? item.base.charAt(0).toUpperCase() + item.base.slice(1)
                          : dishes.find(d => d.id === item.base)?.name || item.base}
                      </div>
                    )}
                    {item.note && item.note.trim() && <div style={{ color: '#666', fontSize: 14 }}>Ghi chú: {item.note}</div>}
                    {dish.basePrice && <div style={{ color: '#C92A15', fontWeight: 500 }}>Giá: {getItemPrice(item).toLocaleString('vi-VN')}₫</div>}
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setConfirmRemove({ open: true, item });
                    }}
                    style={{
                      marginLeft: 8,
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: 18,
                      cursor: 'pointer',
                      alignSelf: 'center',
                    }}
                    title="Xóa món này"
                  >
                    <Trash2 size={20} color="#dc2626" />
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid #eee', margin: window.innerWidth <= 768 ? '8px 0' : '12px 0' }} />
          <div
            style={{
              fontWeight: 600,
              fontSize: window.innerWidth <= 768 ? 15 : 17,
              color: '#C92A15',
              textAlign: 'right',
              margin: window.innerWidth <= 768 ? '6px 0 8px' : '8px 0 12px',
            }}
          >
            Tổng tiền: {totalAmount.toLocaleString('vi-VN')}₫
          </div>
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              background: '#fff',
              zIndex: 10,
              paddingTop: window.innerWidth <= 768 ? 6 : 8,
              paddingBottom: window.innerWidth <= 768 ? 6 : 8,
            }}
          >
            <button
              style={{
                width: '100%',
                background: '#b45309',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: window.innerWidth <= 768 ? '10px 0' : '12px 0',
                fontWeight: 700,
                fontSize: window.innerWidth <= 768 ? 15 : 17,
                marginTop: 0,
                cursor: 'pointer',
              }}
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
            >
              Thanh toán
            </button>
          </div>
        </>
      )}
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
        aria-label="Đóng giỏ hàng"
      >
        &times;
      </button>
      <ModalConfirm
        visible={confirmRemove.open}
        title="Xác nhận xoá"
        message={`Bạn có chắc muốn xoá món '${getDish(confirmRemove.item?.dishId)?.name || ''}' khỏi giỏ hàng không?`}
        btnYes="Xoá"
        btnNo="Huỷ"
        onYes={async () => {
          if (confirmRemove.item) {
            const { dishId, size, base, note } = confirmRemove.item;
            await removeFromCart({
              dishId,
              size: size || undefined,
              base: base || undefined,
              note: note ? note.trim() || undefined : undefined,
            });
          }
          setConfirmRemove({ open: false, item: null });
          // Đóng popup nếu sau khi xóa không còn sản phẩm nào
          setTimeout(() => {
            if (orderItems.length === 1) onClose();
          }, 100);
        }}
        onNo={() => setConfirmRemove({ open: false, item: null })}
        btnYesClassName="bg-[#dc2626] hover:bg-[#b91c1c] text-white border-none"
      />
    </div>
  );
};
