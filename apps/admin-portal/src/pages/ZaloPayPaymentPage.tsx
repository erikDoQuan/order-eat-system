/// <reference types="vite/client" />
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllDishes } from '../services/dish.api';
import { getOrderDetail, getOrderDetailByNumber, createOrder, getOrderDetailByAppTransId } from '../services/order.api';
import '../css/zalo-pay-payment-page.css';
import { QRCodeCanvas } from 'qrcode.react';

const ZaloPayPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any || {};
  const items = state.items || [];
  const customer = state.customer || { name: '', phone: '' };
  const store = state.store || { name: '', address: '' };
  const orderType = state.orderType || 'pickup';
  const shippingFee = orderType === 'delivery' ? (state.shippingFee ?? 25000) : 0;
  const deliveryAddress = state.deliveryAddress || '';

  // Debug: Log state và totalAmount khi vào trang
  useEffect(() => {
    console.log('ZaloPayPaymentPage state:', state);
    console.log('ZaloPayPaymentPage items:', items);
    console.log('ZaloPayPaymentPage totalAmount:', typeof state.totalAmount, state.totalAmount);
  }, []);

  // Lấy danh sách món ăn
  const [dishes, setDishes] = useState<any[]>([]);
  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getDish = (dishId: string) => dishes.find((d) => d.id === dishId);
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    return price;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);
  const totalAmount = typeof state.totalAmount === 'number' && state.totalAmount > 0 ? state.totalAmount : (subtotal + shippingFee);

  const [zalopayInfo, setZaloPayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [countdown, setCountdown] = useState(15 * 60); // 15 phút tính bằng giây
  const [orderCreated, setOrderCreated] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);

  const orderNumber = state.orderNumber; // lấy orderNumber thật từ state

  useEffect(() => {
    if (!totalAmount || totalAmount <= 0) return;
    let usedOrderId = '';
    if (orderNumber) {
      usedOrderId = String(orderNumber);
    } else {
      // fallback: sinh orderId random (không chuẩn, chỉ dùng khi test/demo)
      usedOrderId = String(Date.now()) + Math.floor(Math.random() * 10000);
      setError('⚠️ Không có orderNumber thực tế, mã QR sẽ không đối soát được đơn hàng!');
    }
    setOrderId(usedOrderId);
    setLoading(true);
    fetch(`/api/v1/zalopay/create-order?amount=${totalAmount}&orderId=${usedOrderId}`)
      .then(res => {
        if (!res.ok) throw new Error('API trả về lỗi: ' + res.status);
        return res.json();
      })
      .then(data => {
        setZaloPayInfo(data);
        setLoading(false);
        if (data?.qrcode && data?.return_code === 1) {
          localStorage.setItem('last_zalopay_qr', data.qrcode);
          localStorage.setItem('last_zalopay_amount', String(totalAmount));
          localStorage.setItem('last_zalopay_orderId', usedOrderId);
        } else if (data?.order_url && data?.return_code === 1) {
          localStorage.setItem('last_zalopay_order_url', data.order_url);
          localStorage.setItem('last_zalopay_amount', String(totalAmount));
          localStorage.setItem('last_zalopay_orderId', usedOrderId);
        } else {
          setError(data?.return_message || 'Không thể tạo mã QR ZaloPay.');
        }
      })
      .catch(err => {
        setError('Không thể tạo mã QR ZaloPay: ' + (err?.message || err));
        setLoading(false);
      });
  }, [totalAmount, orderNumber]);


  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(() => {
      
      getOrderDetailByAppTransId(orderId).then(order => {
        if (order && order.status === 'completed') {
          clearInterval(interval);
          navigate(`/ordersuccess?app_trans_id=${orderId}`);
        }
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [orderId, navigate]);

  const appId = import.meta.env.VITE_ZP_APP_ID || '2554';

  // Thêm hàm gọi tạo đơn hàng khi user xác nhận đã thanh toán
  const handleCreateOrder = async () => {
    const payload = {
      userId: state.userId,
      orderItems: { items },
      totalAmount,
      type: orderType,
      deliveryAddress: orderType === 'delivery' ? { address: deliveryAddress } : { address: store.address, storeName: store.name },
      note: '',
      paymentMethod: 'zalopay',
      status: 'completed', // hoặc truyền thêm trạng thái đã thanh toán nếu backend hỗ trợ
    };
    try {
      const orderRes = await createOrder(payload);
      setOrderCreated(true);
      setSuccessOrder(orderRes);
      navigate('/order-success', { state: { order: orderRes } });
    } catch (err) {
      setError('Có lỗi khi lưu đơn hàng sau thanh toán.');
    }
  };

  return (
    <div className="payment-info-root">
      <Navbar />
      <div className="payment-info-container">
        <div className="payment-info-grid">
          {/* Left */}
          <div className="payment-info-left">
            <div className="payment-info-block">
              <div className="payment-info-title">Thông tin đơn hàng</div>
              <div className="payment-info-text">
                <b>Khách hàng:</b> {customer.name} &nbsp; <b>Điện thoại:</b> {customer.phone}
              </div>
              {orderType === 'delivery' ? (
                <div className="payment-info-text">
                  <b>Giao hàng đến:</b> <span className="payment-info-highlight">{deliveryAddress}</span>
                </div>
              ) : (
                <>
                  <div className="payment-info-text">
                    Nhận hàng tại: <span className="payment-info-highlight">{store.name}</span>
                  </div>
                  <div className="payment-info-text">{store.address}</div>
                </>
              )}
              <div className="payment-info-text">
                <b>Giá trị đơn hàng</b>
                <span style={{ float: 'right' }}>{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="payment-info-text">
                <b>Số tiền thanh toán</b>
                <span style={{ float: 'right', fontWeight: 700, fontSize: 18 }}>{totalAmount.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="payment-info-text" style={{ marginTop: 16 }}>
                <b>Mã giao dịch</b>
                <div style={{ fontWeight: 600, fontSize: 16, margin: '4px 0' }}>{zalopayInfo?.order_token || zalopayInfo?.zp_trans_token || '[Chưa có]'}</div>
              </div>
              <div className="payment-info-text">
                <b>Nội dung</b>
                <div style={{ fontWeight: 600, fontSize: 16, margin: '4px 0' }}>ZaloPay demo</div>
              </div>
              <div className="payment-info-block" style={{ marginTop: 12 }}>
                <div className="payment-info-title">Mã khuyến mãi</div>
                <div className="payment-info-input">
                  <input placeholder="Nhập mã khuyến mãi" />
                  <button>Áp dụng</button>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  *Áp dụng khi quét QR bằng ứng dụng ngân hàng
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 15, color: '#555', background: '#f8f8f8', padding: 8, borderRadius: 8 }}>
                Giao dịch kết thúc trong <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{String(Math.floor(countdown / 60)).padStart(2, '0')}</span> : <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>{String(countdown % 60).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="payment-info-right">
            <div className="payment-info-block" style={{ textAlign: 'center' }}>
              <div className="payment-info-title" style={{ fontSize: 22, marginBottom: 16 }}>Quét QR để thanh toán</div>
              <div style={{ background: '#f4f7fb', borderRadius: 16, padding: 24, display: 'inline-block', minWidth: 320 }}>
                {loading ? (
                  <div>Đang tạo mã QR ZaloPay...</div>
                ) : zalopayInfo?.qrcode && zalopayInfo?.return_code === 1 ? (
                  <img
                    src={zalopayInfo.qrcode}
                    alt="QR Code ZaloPay"
                    style={{ width: 200, height: 200, margin: '0 auto 16px', display: 'block' }}
                  />
                ) : zalopayInfo?.order_url && zalopayInfo?.return_code === 1 ? (
                  <QRCodeCanvas value={zalopayInfo.order_url} size={200} style={{ margin: '0 auto 16px', display: 'block' }} />
                ) : zalopayInfo?.return_message ? (
                  <div style={{ color: 'red', fontWeight: 600 }}>
                    {zalopayInfo.return_message}
                  </div>
                ) : error ? (
                  <div style={{ color: 'red', fontWeight: 600 }}>
                    {error}
                  </div>
                ) : (
                  <div style={{ color: 'red', fontWeight: 600 }}>
                    Không thể tạo mã QR ZaloPay. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                  </div>
                )}
                <div style={{ marginTop: 8, fontWeight: 500, color: '#333' }}>
                  Ngân hàng thụ hưởng: VietCapitalBank<br />
                  <span style={{ fontWeight: 700 }}>ZLPDEMO</span><br />
                  99ZP24334000725953
                </div>
              </div>
              <div style={{ marginTop: 24, fontSize: 15, color: '#555' }}>
                Mở ứng dụng có VietQR để thanh toán đơn hàng
                <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ width: 32, height: 32, background: '#eee', borderRadius: '50%', display: 'inline-block', textAlign: 'center', lineHeight: '32px', fontWeight: 600 }}>+34</span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <a href="#" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>Hướng dẫn thanh toán</a>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: '#6b9080',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 120,
                  transition: 'all 0.2s',
                }}
              >
                Quay lại
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={orderCreated}
                style={{
                  background: '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: orderCreated ? 'not-allowed' : 'pointer',
                  minWidth: 180,
                  transition: 'all 0.2s',
                  opacity: orderCreated ? 0.6 : 1,
                }}
              >
                Tôi đã thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayPaymentPage;
