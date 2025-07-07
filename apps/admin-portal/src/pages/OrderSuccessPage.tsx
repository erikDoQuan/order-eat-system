import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/OrderSuccessPage.css';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import axios from 'axios';

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId || 'MÃ ĐƠN';
  const { clearCart } = useCart();
  const [orderNumber, setOrderNumber] = useState<string | number>('...');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  useEffect(() => {
    if (orderId && orderId !== 'MÃ ĐƠN') {
      axios.get(`/api/v1/orders/${orderId}`)
        .then(res => {
          if (res.data?.data?.order_number || res.data?.data?.orderNumber) {
            setOrderNumber(res.data?.data?.order_number || res.data?.data?.orderNumber);
          } else {
            setOrderNumber('...');
          }
        })
        .catch(() => setOrderNumber('...'));
    } else {
      setOrderNumber('...');
    }
  }, [orderId]);

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
              BẠN ĐÃ ĐẶT HÀNG THÀNH CÔNG!
            </div>
            <div className="order-success-thank">Cảm ơn bạn đã đặt hàng tại BẾP CỦA MẸ</div>
            <div className="order-success-orderid">
              Mã đơn hàng của bạn là: <span>#{orderNumber}</span>
            </div>
            <div className="order-success-track">
              Để kiểm tra tình trạng đơn hàng vui lòng click vào đây: <a href="#">THEO DÕI ĐƠN HÀNG</a>
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