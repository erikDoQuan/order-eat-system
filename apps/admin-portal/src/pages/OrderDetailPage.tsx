import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetail } from '../services/order.api';
import Navbar from '../components/Navbar';
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
  // Hàm tính giá đúng cho từng item (đồng bộ với CartPopup/CheckoutPage)
  const getItemPrice = (item: any) => {
    let price = Number(item.basePrice ?? item.price ?? 0);
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      if (item.toppingPrice) price += Number(item.toppingPrice) || 0;
      else if (item.basePrice && item.base !== item.dishId) price += Number(item.basePrice) || 0;
      else if (item.basePriceExtra) price += Number(item.basePriceExtra) || 0;
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
      <div className="order-detail-root">
        <h1 className="order-detail-title">
        Chi tiết đơn hàng # {orderNumber}
      </h1>
        <div className="order-detail-status-row">
          <span
            className="order-detail-status-text"
            style={{
              color:
                status === 'confirmed' || status === 'completed'
                  ? '#16a34a'
                  : status === 'cancelled'
                  ? '#dc2626'
                  : undefined,
              fontWeight: 700,
            }}
          >
            {getOrderStatusText(status)}
          </span>
          <span className="order-detail-date">
          Ngày đặt hàng: {new Date(createdAt).toLocaleString('vi-VN')}
        </span>
      </div>
        <div className="order-detail-info-row">
          <div className="order-detail-info-block">
            <div className="order-detail-info-title">ĐỊA CHỈ NHẬN HÀNG</div>
          <div><b>Địa chỉ</b><br />{typeof deliveryAddress === 'string' ? deliveryAddress : deliveryAddress?.address || '-'}</div>
            <div className="order-detail-info-phone"><b>Điện thoại</b><br /><span>{phone}</span></div>
        </div>
          <div className="order-detail-info-block">
            <div className="order-detail-info-title">HÌNH THỨC ĐẶT HÀNG</div>
          <div><b>Phương thức đặt hàng</b><br />{type === 'delivery' ? 'Giao hàng tận nơi' : 'Nhận hàng tại cửa hàng'}</div>
          <div style={{ marginTop: 8 }}><b>Phí vận chuyển</b><br />{Number(shippingFee).toLocaleString('vi-VN')}đ</div>
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
            {items.length === 0 ? (
                <div className="order-detail-empty">Chưa có món nào trong đơn hàng</div>
            ) : (
                <div className="order-detail-product-list-items">
                {items.map((item: any, idx: number) => (
                    <div key={idx} className="order-detail-product-item">
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                          className="order-detail-product-img"
                      />
                    )}
                      <div className="order-detail-product-info">
                        <div className="order-detail-product-name">{item.name || `Món: ${item.dishId}`}</div>
                      {item.description && (
                          <div className="order-detail-product-desc">{item.description}</div>
                      )}
                        {item.size && <div className="order-detail-product-size">Size: {item.size}</div>}
                      {item.base && (
                          <div className="order-detail-product-base">Đế: {['dày', 'mỏng'].includes(item.base) ? item.base.charAt(0).toUpperCase() + item.base.slice(1) : (item.baseName || item.base)}</div>
                      )}
                        {item.note?.trim() && <div className="order-detail-product-note">Ghi chú: {item.note}</div>}
                    </div>
                      <div className="order-detail-product-qtyprice">
                        <div className="order-detail-product-qty">×{item.quantity}</div>
                        <div className="order-detail-product-price">{(getItemPrice(item) * Number(item.quantity ?? 0)).toLocaleString('vi-VN')}₫</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          <div className="order-detail-summary-block">
            <div className="order-detail-summary-inner">
              <div className="order-detail-summary-row">
                <span>Tạm tính (x{items.reduce((sum, i) => sum + i.quantity, 0)})</span>
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