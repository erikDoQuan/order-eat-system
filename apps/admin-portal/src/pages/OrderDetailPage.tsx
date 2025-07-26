import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { getAllDishes } from '../services/dish.api';
import { getOrderDetail } from '../services/order.api';
import { getOrderStatusText } from './orderStatus.utils';

import './OrderDetailPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getImageUrl = (imageUrl: string | undefined | null) => {
  if (!imageUrl) return '/default-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_URL}/api/v1/files/public/${imageUrl}`;
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      getOrderDetail(orderId)
        .then(data => {
          if (!data || !data.id) {
            setError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.');
            setOrder(null);
          } else {
            setOrder(data);
            setError(null);
          }
        })
        .catch(() => {
          setError('Không tìm thấy đơn hàng hoặc bạn không có quyền xem đơn này.');
          setOrder(null);
        });
    }
  }, [orderId]);

  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>{error}</div>;
  if (!order) return <div>Đang tải...</div>;

  const items = order.orderItems?.items || [];
  const getProductName = (item: any) => item.dishSnapshot?.name || item.name || getDish(item.dishId)?.name || '-';
  const getProductPrice = (item: any) => {
    if (item.dishSnapshot?.basePrice !== undefined) return Number(item.dishSnapshot.basePrice);
    if (item.price !== undefined) return Number(item.price);
    const dish = getDish(item.dishId);
    return dish ? Number(dish.basePrice) : 0;
  };
  const getProductImage = (item: any) => item.dishSnapshot?.imageUrl || item.image || getDish(item.dishId)?.imageUrl || '/default-image.png';
  const getProductQuantity = (item: any) => item.quantity ?? 0;
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);
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
  const orderNumber = order.order_number || order.orderNumber || order.id;
  const createdAt = order.createdAt;
  const totalAmount = order.totalAmount;
  const status = order.status;
  const type = order.type;
  const pickupTime = order.pickupTime;
  const deliveryAddress = order.deliveryAddress;
  const phone = order.phone || (typeof deliveryAddress === 'object' ? deliveryAddress?.phone : undefined) || '-';
  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : type === 'delivery' ? 25000 : 0;
  const paymentMethod = order.paymentMethod || 'Thanh toán khi nhận hàng';

  // Gộp các item giống nhau (cùng dishId, size, base, note)
  function mergeOrderItems(items: any[]) {
    const map = new Map();
    for (const item of items) {
      const key = [item.dishId, item.size, item.base, item.note].join('|');
      if (map.has(key)) {
        map.get(key).quantity += Number(item.quantity ?? 0);
      } else {
        map.set(key, { ...item, quantity: Number(item.quantity ?? 0) });
      }
    }
    return Array.from(map.values());
  }
  const mergedItems = mergeOrderItems(items);

  const subtotal = mergedItems.reduce((sum, item) => sum + getProductPrice(item) * Number(item.quantity ?? 0), 0);
  const total = subtotal + Number(shippingFee);
  return (
    <>
      <Navbar />
      <div className="order-detail-root">
        <h1 className="order-detail-title">Chi tiết đơn hàng # {orderNumber}</h1>
        <div className="order-detail-status-row">
          <span
            className="order-detail-status-text"
            style={{
              color: status === 'confirmed' || status === 'completed' ? '#16a34a' : status === 'cancelled' ? '#dc2626' : undefined,
              fontWeight: 700,
            }}
          >
            {getOrderStatusText(status)}
          </span>
          <span className="order-detail-date">Ngày đặt hàng: {new Date(createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div className="order-detail-info-row">
          <div className="order-detail-info-block">
            <div className="order-detail-info-title">ĐỊA CHỈ NHẬN HÀNG</div>
            <div>
              <b>Địa chỉ</b>
              <br />
              {typeof deliveryAddress === 'string' ? deliveryAddress : deliveryAddress?.address || '-'}
            </div>
            <div className="order-detail-info-phone">
              <b>Điện thoại</b>
              <br />
              <span>{phone}</span>
            </div>
          </div>
          <div className="order-detail-info-block">
            <div className="order-detail-info-title">HÌNH THỨC ĐẶT HÀNG</div>
            <div>
              <b>Phương thức đặt hàng</b>
              <br />
              {type === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận hàng tại cửa hàng'}
            </div>
            <div style={{ marginTop: 8 }}>
              <b>Phí vận chuyển</b>
              <br />
              {Number(shippingFee).toLocaleString('vi-VN')}đ
            </div>
          </div>
          <div className="order-detail-info-block">
            <div className="order-detail-info-title">HÌNH THỨC THANH TOÁN</div>
            <div>{paymentMethod}</div>
            <div className="order-detail-payment-status">{order.paymentStatus}</div>
          </div>
        </div>
        <div className="order-detail-product-row">
          <div className="order-detail-product-list">
            <div className="order-detail-product-list-inner">
              <h2 className="order-detail-product-title">Sản phẩm</h2>
              {mergedItems.length === 0 ? (
                <div className="order-detail-empty">Chưa có món nào trong đơn hàng</div>
              ) : (
                <div className="order-detail-product-list-items">
                  {mergedItems.map((item: any, idx: number) => {
                    return (
                      <div key={idx} className="order-detail-product-item">
                        {getProductImage(item) && (
                          <img src={getImageUrl(getProductImage(item))} alt={getProductName(item)} className="order-detail-product-img" />
                        )}
                        <div className="order-detail-product-info">
                          <div className="order-detail-product-name">{getProductName(item)}</div>
                          {/* Nếu có mô tả trong snapshot thì ưu tiên, nếu không thì lấy từ dish */}
                          {(item.dishSnapshot?.description || getDish(item.dishId)?.description) && (
                            <div className="order-detail-product-desc">{item.dishSnapshot?.description || getDish(item.dishId)?.description}</div>
                          )}
                          {item.size && <div className="order-detail-product-size">Size: {item.size}</div>}
                          {item.base && (
                            <div className="order-detail-product-base">
                              Đế:{' '}
                              {item.base === 'dày' || item.base === 'mỏng'
                                ? item.base.charAt(0).toUpperCase() + item.base.slice(1)
                                : dishes.find(d => d.id === item.base)?.name || item.base}
                            </div>
                          )}
                          {item.note?.trim() && <div className="order-detail-product-note">Ghi chú: {item.note}</div>}
                        </div>
                        <div className="order-detail-product-qtyprice">
                          <div className="order-detail-product-qty">×{item.quantity}</div>
                          <div className="order-detail-product-price">
                            {(getProductPrice(item) * Number(item.quantity ?? 0)).toLocaleString('vi-VN')}₫
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="order-detail-summary-block">
            <div className="order-detail-summary-inner">
              <div className="order-detail-summary-row">
                <span>Tạm tính (x{mergedItems.reduce((sum, i) => sum + i.quantity, 0)})</span>
                <span className="order-detail-summary-subtotal">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="order-detail-summary-row">
                <span>Giảm giá</span>
                <span>0đ</span>
              </div>
              <div className="order-detail-summary-row">
                <span>Phí giao hàng</span>
                <span>{Number(shippingFee).toLocaleString('vi-VN')}đ</span>
              </div>
              <hr className="order-detail-summary-divider" />
              <div className="order-detail-summary-totalrow">
                <span>Tổng tiền</span>
                <span className="order-detail-summary-total">{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>
        <div className="order-detail-btn-row">
          <button className="order-detail-back-btn" onClick={() => window.history.back()}>
            <span className="order-detail-back-arrow">&larr;</span> Quay lại
          </button>
        </div>
      </div>
    </>
  );
}
