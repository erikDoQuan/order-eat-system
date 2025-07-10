import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail } from '../services/order.api';
import Navbar from '../components/Navbar';
import { getOrderStatusText } from './orderStatus.utils';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      getOrderDetail(orderId)
        .then(setOrder)
        .catch(() => setOrder(null));
    }
  }, [orderId]);

  if (!order) return <div>Đang tải...</div>;

  const items = order.orderItems?.items || [];
  const getProductName = (item: any) => item.name || '-';
  const getProductPrice = (item: any) => Number(item.price ?? 0);
  const getProductImage = (item: any) => item.image || '/default-image.png';
  const getProductQuantity = (item: any) => item.quantity ?? 0;
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getItemPrice = (item: any) => {
    let price = Number(item.price ?? 0);
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      if (item.toppingPrice) price += Number(item.toppingPrice) || 0;
      else if (item.basePrice && item.base !== item.dishId) price += Number(item.basePrice) || 0;
    }
    return price;
  };
  const orderNumber = order.order_number || order.orderNumber || order.id;
  const createdAt = order.createdAt;
  const totalAmount = order.totalAmount;
  const status = order.status;
  const type = order.type;
  const pickupTime = order.pickupTime;
  const deliveryAddress = order.deliveryAddress;
  const phone = order.phone || (typeof deliveryAddress === 'object' ? deliveryAddress?.phone : undefined) || '-';
  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : (type === 'delivery' ? 25000 : 0);
  const paymentMethod = order.paymentMethod || 'Thanh toán khi nhận hàng';
  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * Number(item.quantity ?? 0), 0);
  const total = Number(order.totalAmount ?? 0);
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 12 }}>
          Chi tiết đơn hàng # {orderNumber}
        </h1>
        <div style={{ background: '#eaf7ec', borderRadius: 8, padding: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#17823c', fontWeight: 600, fontSize: 20 }}>
            {getOrderStatusText(status)}
          </span>
          <span style={{ color: '#222', fontSize: 15 }}>
            Ngày đặt hàng: {new Date(createdAt).toLocaleString('vi-VN')}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
            <div style={{ color: '#17823c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>ĐỊA CHỈ NHẬN HÀNG</div>
            <div><b>Địa chỉ</b><br />{typeof deliveryAddress === 'string' ? deliveryAddress : deliveryAddress?.address || '-'}</div>
            <div style={{ marginTop: 8 }}><b>Điện thoại</b><br /><span style={{ color: '#1976d2', fontWeight: 500 }}>{phone}</span></div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
            <div style={{ color: '#17823c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>HÌNH THỨC ĐẶT HÀNG</div>
            <div><b>Phương thức đặt hàng</b><br />{type === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận hàng tại cửa hàng'}</div>
            <div style={{ marginTop: 8 }}><b>Phí vận chuyển</b><br />{Number(shippingFee).toLocaleString('vi-VN')}đ</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
            <div style={{ color: '#17823c', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>HÌNH THỨC THANH TOÁN</div>
            <div>{paymentMethod}</div>
            <div style={{ color: '#17823c', marginTop: 8 }}>{order.paymentStatus}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 32 }}>
          <div style={{ flex: 2 }}>
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 18 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Sản phẩm</h2>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                  Chưa có món nào trong đơn hàng
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  {items.map((item: any, idx: number) => (
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
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
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
                          {item.name || `Món: ${item.dishId}`}
                        </div>
                        {item.description && (
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
                            {item.description}
                          </div>
                        )}
                        {item.size && <div style={{ fontSize: 14 }}>Size: {item.size}</div>}
                        {item.base && (
                          <div style={{ fontSize: 14 }}>
                            Đế: {['dày', 'mỏng'].includes(item.base) ? item.base.charAt(0).toUpperCase() + item.base.slice(1) : (item.baseName || item.base)}
                          </div>
                        )}
                        {item.note?.trim() && <div style={{ fontSize: 14 }}>Ghi chú: {item.note}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}>×{item.quantity}</div>
                        <div style={{ minWidth: 110, textAlign: 'right', fontSize: 17, fontWeight: 600 }}>
                          {(getItemPrice(item) * Number(item.quantity ?? 0)).toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001', padding: 28, minWidth: 320, maxWidth: 360, width: '100%' }}>
              <div style={{ borderLeft: '24px solid #19a34a', borderRadius: '8px 0 0 8px', background: '#fff', padding: '0 0 0 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span>Tạm tính (x{items.reduce((sum, i) => sum + i.quantity, 0)})</span>
                  <span style={{ fontWeight: 500 }}>{subtotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span>Giảm giá</span>
                  <span>0đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <span>Phí giao hàng</span>
                  <span>{Number(shippingFee).toLocaleString('vi-VN')}đ</span>
                </div>
                <hr style={{ margin: '18px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, fontSize: 20 }}>
                  <span>Tổng tiền</span>
                  <span style={{ color: 'red', fontWeight: 700, fontSize: 22 }}>{total.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 32, marginTop: 36, justifyContent: 'center' }}>
          <button style={{ background: '#7a9680', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 48px', fontSize: 20, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => window.history.back()}>
            <span style={{ fontSize: 28 }}>&larr;</span> Quay lại
          </button>
        </div>
      </div>
    </>
  );
} 