import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import '../css/OrderSuccessPage.css';

import axios from 'axios';

import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import { createOrder, getOrderDetail } from '../services/order.api';

const OrderSuccessPage: React.FC = () => {
  console.log('OrderSuccessPage rendered');
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | number>('...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy order từ state nếu có
  const order = location.state?.order;
  // Lấy orderId từ state, order, hoặc query string (ZaloPay redirect)
  const orderId = location.state?.orderId || order?.id || new URLSearchParams(location.search).get('orderId') || undefined;
  // Lấy order_number từ app_trans_id trên URL nếu có (ZaloPay redirect)
  const params = new URLSearchParams(location.search);
  // Lấy appTransId từ order nếu có, fallback sang URL params
  let appTransId = order?.appTransId || order?.app_trans_id || params.get('app_trans_id');
  // Nếu appTransId là số (orderNumber), không dùng cho getOrderByAppTransId
  if (appTransId && (!isNaN(Number(appTransId)) || String(appTransId).length < 10)) {
    appTransId = undefined;
  }
  // Lấy paymentMethod từ order nếu có, fallback sang state hoặc appTransId
  const paymentMethod = order?.paymentMethod || location.state?.paymentMethod || (appTransId ? 'zalopay' : undefined);
  const orderUrl = location.state?.order_url;

  useEffect(() => {
    console.log('OrderSuccessPage useEffect - clearCart');
    clearCart();
    // Xoá thông tin đơn hàng tạm của ZaloPay khỏi localStorage
    localStorage.removeItem('last_zalopay_order_url');
    localStorage.removeItem('last_zalopay_qr');
    localStorage.removeItem('last_zalopay_amount');
    localStorage.removeItem('last_zalopay_orderId');
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log('OrderSuccessPage useEffect - location state:', location.state);
    console.log('OrderSuccessPage useEffect - order:', order);
    console.log('OrderSuccessPage useEffect - orderId:', orderId);
    // Đã bỏ log orderNumberFromAppTransId vì không còn dùng

    if (order) {
      setOrderNumber(order.order_number || order.orderNumber || order.id || '...');
      setError(null);
    } else if (orderId) {
      setLoading(true);
      getOrderDetail(orderId)
        .then(data => {
          setOrderNumber(data.order_number || data.orderNumber || data.id || '...');
          setError(null);
        })
        .catch(() => {
          setError('Không tìm thấy thông tin đơn hàng.');
        })
        .finally(() => setLoading(false));
    } else if (appTransId) {
      setLoading(true);
      import('../services/order.api').then(api => {
        api
          .getOrderByAppTransId(appTransId)
          .then(data => {
            setOrderNumber(data.order_number || data.orderNumber || data.id || '...');
            setError(null);
          })
          .catch(() => {
            setError('Không tìm thấy thông tin đơn hàng từ ZaloPay.');
          })
          .finally(() => setLoading(false));
      });
    } else {
      setError('Không có thông tin đơn hàng.');
    }
  }, [order, orderId, appTransId]);

  return (
    <div className="order-success-root">
      <Navbar />
      <div className="order-success-outer">
        <div className="order-success-container">
          <div className="order-success-left">
            <div className="order-success-title">Thank you !!!</div>
            <img src="/muahangthanhcong.png" alt="Đặt hàng thành công" className="order-success-img" />
          </div>
          <div className="order-success-right">
            <div className="order-success-successbox">
              {error ? <span className="order-success-error">{error}</span> : 'BẠN ĐÃ ĐẶT HÀNG THÀNH CÔNG!'}
            </div>
            <div className="order-success-thank">Cảm ơn bạn đã đặt hàng tại BẾP CỦA MẸ</div>
            <div className="order-success-orderid">
              Mã đơn hàng của bạn là: <span>#{loading ? '...' : orderNumber}</span>
            </div>

            {/* Không render order-success-zalopay nữa */}
            {paymentMethod === 'cash' && (
              <div
                className="order-success-cash"
                style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  margin: '16px 0',
                  border: '1px solid #e9ecef',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '8px', color: '#22c55e' }}>Thanh toán khi nhận hàng</div>
                <div style={{ fontSize: '14px', marginBottom: '12px', color: '#666' }}>
                  Đơn hàng của bạn sẽ được thanh toán trực tiếp khi nhận hàng. Cảm ơn bạn!
                </div>
              </div>
            )}

            <div className="order-success-track">
              Để kiểm tra tình trạng đơn hàng vui lòng click vào đây:
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  if (orderId || (order && (order.id || order.orderId))) {
                    const id = orderId || order.id || order.orderId;
                    navigate(`/orders/${id}`);
                  } else {
                    alert('Không tìm thấy mã đơn hàng!');
                  }
                }}
              >
                THEO DÕI ĐƠN HÀNG
              </a>
            </div>
            <div className="order-success-hotline">
              Mọi thắc mắc và yêu cầu hỗ trợ vui lòng liên hệ tổng đài CSKH: <span>0337782571</span>
            </div>
            <div className="order-success-support">Cảm ơn bạn đã ủng hộ!</div>
            <button className="order-success-homebtn" onClick={() => navigate('/')}>
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
