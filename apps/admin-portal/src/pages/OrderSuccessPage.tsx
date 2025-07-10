import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/OrderSuccessPage.css';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import axios from 'axios';
import { createOrder, getOrderDetail } from '../services/order.api';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | number>('...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const order = location.state?.order;
  const orderId = location.state?.orderId;

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line
  }, []); // chỉ chạy 1 lần khi mount

  useEffect(() => {
    if (order) {
      setOrderNumber(order.order_number || order.orderNumber || order.id || '...');
    } else if (orderId) {
      setLoading(true);
      getOrderDetail(orderId)
        .then((data) => {
          setOrderNumber(data.order_number || data.orderNumber || data.id || '...');
          setError(null);
        })
        .catch(() => {
          setError('Không tìm thấy thông tin đơn hàng.');
        })
        .finally(() => setLoading(false));
    } else {
      setError('Không có thông tin đơn hàng.');
    }
  }, [order, orderId]);

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
              {error ? (
                <span className="order-success-error">{error}</span>
              ) : (
                'BẠN ĐÃ ĐẶT HÀNG THÀNH CÔNG!'
              )}
            </div>
            <div className="order-success-thank">Cảm ơn bạn đã đặt hàng tại BẾP CỦA MẸ</div>
            <div className="order-success-orderid">
              Mã đơn hàng của bạn là: <span>#{loading ? '...' : orderNumber}</span>
            </div>
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
            <button
              className="order-success-homebtn"
              onClick={() => navigate('/')}
            >
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 