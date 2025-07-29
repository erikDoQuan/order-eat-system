import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
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
  const { user } = useContext(AuthContext);
  const [order, setOrder] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (orderId) {
      getOrderDetail(orderId)
        .then(data => {
          console.log('🔍 OrderDetailPage - Full order data:', data);
          console.log('🔍 OrderDetailPage - Order items:', data?.orderItems?.items);
          console.log('🔍 OrderDetailPage - User info:', data?.user);
          console.log('🔍 OrderDetailPage - Delivery address:', data?.deliveryAddress);
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

  // Đảm bảo thông tin user được load đầy đủ
  useEffect(() => {
    if (order && user) {
      console.log('🔍 OrderDetailPage - User loaded:', user);
      console.log('🔍 OrderDetailPage - Order loaded:', order);
      setUserLoaded(true);
    }
  }, [order, user]);

  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: 40, fontWeight: 600 }}>{error}</div>;
  if (!order) return <div>Đang tải...</div>;

  const items = order.orderItems?.items || [];
  const getProductName = (item: any) => {
    // CHỈ lấy từ snapshot hoặc item đã được enrich từ backend
    if (item.dishSnapshot?.name) return item.dishSnapshot.name;
    if (item.name) return item.name;
    return '-';
  };

  const getProductImage = (item: any) => {
    // CHỈ lấy từ snapshot hoặc item đã được enrich từ backend
    if (item.dishSnapshot?.imageUrl) return item.dishSnapshot.imageUrl;
    if (item.image) return item.image;
    return '/default-image.png';
  };

  const getProductDescription = (item: any) => {
    // CHỈ lấy từ snapshot hoặc item đã được enrich từ backend
    if (item.dishSnapshot?.description) return item.dishSnapshot.description;
    if (item.description) return item.description;
    return null;
  };

  const getToppingName = (item: any) => {
    // CHỈ lấy từ baseName đã được enrich từ backend
    if (item.baseName) return item.baseName;
    // Nếu không có baseName, trả về item.base
    return item.base;
  };

  const getProductQuantity = (item: any) => item.quantity ?? 0;
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);
  const getItemPrice = (item: any) => {
    // CHỈ lấy giá từ snapshot hoặc item đã được enrich từ backend
    if (item.dishSnapshot?.basePrice !== undefined) {
      let price = Number(item.dishSnapshot.basePrice);
      // Tính thêm giá size nếu có
      if (item.size) {
        price += sizeOptions.find(s => s.value === item.size)?.price || 0;
      }
      // Tính thêm giá topping nếu có
      if (item.toppingPrice !== undefined) {
        price += Number(item.toppingPrice);
      }
      return price;
    }

    // Nếu không có snapshot, lấy từ item.price đã được enrich từ backend
    if (item.price !== undefined) {
      let price = Number(item.price);
      // Tính thêm giá size nếu có
      if (item.size) {
        price += sizeOptions.find(s => s.value === item.size)?.price || 0;
      }
      // Tính thêm giá topping nếu có
      if (item.toppingPrice !== undefined) {
        price += Number(item.toppingPrice);
      }
      return price;
    }

    // Nếu không có snapshot và không có item.price, trả về 0
    return 0;
  };
  const orderNumber = order.order_number || order.orderNumber || order.id;
  const createdAt = order.createdAt;
  const totalAmount = order.totalAmount;
  const status = order.status;
  const type = order.type;
  const pickupTime = order.pickupTime;
  const deliveryAddress = order.deliveryAddress;
  const address = (typeof deliveryAddress === 'object' && deliveryAddress?.address) || (userLoaded && user?.address) || '-';
  const phone =
    order.user?.phone ||
    (typeof deliveryAddress === 'object' && deliveryAddress?.phone) ||
    (userLoaded && (user?.phoneNumber || user?.phone_number)) ||
    '-';

  console.log('🔍 OrderDetailPage - deliveryAddress:', deliveryAddress);
  console.log('🔍 OrderDetailPage - address:', address);
  console.log('🔍 OrderDetailPage - user address:', user?.address);
  const shippingFee = order.shippingFee !== undefined ? order.shippingFee : type === 'delivery' ? 25000 : 0;
  const getPaymentMethodDisplay = (method: string) => {
    if (method === 'zalopay') return 'Thanh toán bằng ZaloPay';
    if (method === 'cash') return 'Thanh toán bằng tiền mặt';
    if (method === 'cod') return 'Thanh toán khi nhận hàng';
    return method || 'Thanh toán khi nhận hàng';
  };

  const paymentMethod = getPaymentMethodDisplay(order.paymentMethod);

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

  // Sử dụng totalAmount từ order thay vì tính toán lại
  const total = Number(order.totalAmount);
  const subtotal = total - Number(shippingFee);

  // Hàm lấy giá đã lưu của item
  const getItemSavedPrice = (item: any) => {
    // Nếu chỉ có 1 item, sử dụng tổng tiền đã lưu
    if (mergedItems.length === 1) {
      return total - Number(shippingFee);
    }

    // Ưu tiên lấy từ item.price đã được lưu
    if (item.price !== undefined && item.price !== null) {
      return Number(item.price);
    }
    // Nếu không có, lấy từ dishSnapshot.price
    if (item.dishSnapshot?.price !== undefined && item.dishSnapshot?.price !== null) {
      return Number(item.dishSnapshot.price);
    }
    // Cuối cùng mới tính toán từ snapshot
    return getItemPrice(item);
  };
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
              {address}
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
            {type === 'pickup' && pickupTime && (
              <div style={{ marginTop: 8 }}>
                <b>Thời gian nhận hàng</b>
                <br />
                <span style={{ color: '#16a34a', fontWeight: 600 }}>{pickupTime}</span>
              </div>
            )}
            <div style={{ marginTop: 8 }}>
              <b>Phí vận chuyển</b>
              <br />
              {Number(shippingFee).toLocaleString('vi-VN')}₫
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
                          {/* Ưu tiên lấy description từ dishSnapshot trước tiên */}
                          {getProductDescription(item) && <div className="order-detail-product-desc">{getProductDescription(item)}</div>}
                          {item.size && <div className="order-detail-product-size">Size: {item.size}</div>}
                          {item.base && (
                            <div className="order-detail-product-base">
                              Đế:{' '}
                              {item.base === 'dày' || item.base === 'mỏng'
                                ? item.base.charAt(0).toUpperCase() + item.base.slice(1)
                                : getToppingName(item)}
                            </div>
                          )}
                          {item.note?.trim() && <div className="order-detail-product-note">Ghi chú: {item.note}</div>}
                        </div>
                        <div className="order-detail-product-qtyprice">
                          <div className="order-detail-product-qty">×{item.quantity}</div>
                          <div className="order-detail-product-price">
                            {(getItemSavedPrice(item) * Number(item.quantity ?? 0)).toLocaleString('vi-VN')}₫
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
                <span className="order-detail-summary-subtotal">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              <div className="order-detail-summary-row">
                <span>Giảm giá</span>
                <span>0₫</span>
              </div>
              <div className="order-detail-summary-row">
                <span>Phí giao hàng</span>
                <span>{Number(shippingFee).toLocaleString('vi-VN')}₫</span>
              </div>
              <hr className="order-detail-summary-divider" />
              <div className="order-detail-summary-totalrow">
                <span>Tổng tiền</span>
                <span className="order-detail-summary-total">{total.toLocaleString('vi-VN')}₫</span>
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
