import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getOrderItemsByUserId } from '../services/user.api';
import { getAllDishes } from '../services/dish.api';
import type { Dish } from '../types/dish.type';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { ModalConfirm } from '../../../../packages/react-web-ui-shadcn/src/components/modals/modal-confirm';

export const CartPopup: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { orderItems, removeFromCart } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; item: any | null }>({ open: false, item: null });

  useEffect(() => {
    getAllDishes().then(setDishes).catch(() => setDishes([]));
  }, []);

  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);

  // Tính tổng tiền
  const totalAmount = orderItems.reduce((sum, item) => {
    const dish = getDish(item.dishId);
    const price = dish && dish.basePrice ? Number(dish.basePrice) : 0;
    return sum + price * (item.quantity || 1);
  }, 0);

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
    <div style={{ position: 'absolute', top: 50, right: 0, width: 420, background: '#fff', borderRadius: 16, boxShadow: '0 4px 32px #0003', zIndex: 100, padding: 32, display: 'flex', flexDirection: 'column', maxHeight: 600 }}>
      <div style={{ fontWeight: 800, fontSize: 22, marginBottom: 18 }}>Giỏ hàng</div>
      {loading ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Đang tải...</div>
      ) : orderItems.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 32 }}>Chưa có món nào trong giỏ hàng</div>
      ) : (
        <>
          <div style={{ flex: 1, maxHeight: 320, overflowY: 'auto', marginBottom: 12 }}>
            {orderItems.map((item, idx) => {
              const dish = getDish(item.dishId);
              return (
                <div key={`${item.dishId}-${item.size || ''}-${item.base || ''}-${item.note || ''}-${idx}`} style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
                  {dish && dish.imageUrl && (
                    <img src={dish.imageUrl} alt={dish.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{dish ? dish.name : `Món: ${item.dishId}`}</div>
                    {dish && <div style={{ color: '#666', fontSize: 14 }}>{dish.description}</div>}
                    <div style={{ color: '#666', fontSize: 15 }}>Số lượng: {item.quantity}</div>
                    {item.size && (
                      <div style={{ color: '#666', fontSize: 14 }}>Size: {item.size}</div>
                    )}
                    {item.base && (
                      <div style={{ color: '#666', fontSize: 14 }}>
                        Đế: {item.base === 'dày' || item.base === 'mỏng'
                          ? item.base.charAt(0).toUpperCase() + item.base.slice(1)
                          : (dishes.find(d => d.id === item.base)?.name || item.base)}
                      </div>
                    )}
                    {item.note && item.note.trim() && (
                      <div style={{ color: '#666', fontSize: 14 }}>Ghi chú: {item.note}</div>
                    )}
                    {dish && dish.basePrice && (
                      <div style={{ color: '#C92A15', fontWeight: 500 }}>Giá: {Number(dish.basePrice).toLocaleString('vi-VN')}₫</div>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmRemove({ open: true, item })}
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
          <div style={{ borderTop: '1px solid #eee', margin: '12px 0' }} />
          <div style={{ fontWeight: 600, fontSize: 17, color: '#C92A15', textAlign: 'right', margin: '8px 0 12px' }}>
            Tổng tiền: {totalAmount.toLocaleString('vi-VN')}₫
          </div>
          <button
            style={{ width: '100%', background: '#17823c', color: 'white', border: 'none', borderRadius: 8, padding: '12px 0', fontWeight: 700, fontSize: 17, marginTop: 12, cursor: 'pointer' }}
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}
          >Thanh toán</button>
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
            await removeFromCart({
              dishId: confirmRemove.item.dishId,
              size: confirmRemove.item.size,
              base: confirmRemove.item.base,
              note: confirmRemove.item.note,
            });
          }
          setConfirmRemove({ open: false, item: null });
        }}
        onNo={() => setConfirmRemove({ open: false, item: null })}
        btnYesClassName="bg-[#dc2626] hover:bg-[#b91c1c] text-white border-none"
      />
    </div>
  );
}; 