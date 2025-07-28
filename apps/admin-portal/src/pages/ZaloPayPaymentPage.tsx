/// <reference types="vite/client" />
import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';
import { createOrder, getOrderDetail, getOrderDetailByAppTransId, getOrderDetailByNumber } from '../services/order.api';

import '../css/zalo-pay-payment-page.css';

import { QRCodeCanvas } from 'qrcode.react';

const ZaloPayPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart } = useCart();
  const state = (location.state as any) || {};
  const items = state.items || [];
  const customer = state.customer || { name: '', phone: '' };
  const store = state.store || { name: '', address: '' };
  const orderType = state.orderType || 'pickup';
  const shippingFee = orderType === 'delivery' ? (state.shippingFee ?? 25000) : 0;
  const deliveryAddress = state.deliveryAddress || '';

  // Kiểm tra nếu user quay lại từ OrderSuccessPage thì redirect về trang chủ
  useEffect(() => {
    const hasCompletedPayment = localStorage.getItem('zalopay_payment_completed');
    if (hasCompletedPayment === 'true') {
      // Clear flag và redirect về trang chủ
      localStorage.removeItem('zalopay_payment_completed');
      navigate('/', { replace: true });
      return;
    }
  }, [navigate]);

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
  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find(s => s.value === item.size)?.price || 0;
    }
    // Thêm phần cộng giá base nếu base là topping (giống CartPopup)
    if (item.base && item.base !== 'dày' && item.base !== 'mỏng') {
      const topping = dishes.find(d => d.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
    }
    return price;
  };

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);
  const totalAmount = typeof state.totalAmount === 'number' && state.totalAmount > 0 ? state.totalAmount : subtotal + shippingFee;

  const [zalopayInfo, setZaloPayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string>('');
  const [countdown, setCountdown] = useState(15 * 60); // 15 phút tính bằng giây
  const [orderCreated, setOrderCreated] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Luôn sinh appTransId mới mỗi lần vào trang hoặc reload (không reuse lại)
  const [appTransId, setAppTransId] = useState<string>('');

  useEffect(() => {
    // Clear state cũ khi vào trang mới
    setZaloPayInfo(null);
    setOrderId('');
    setError('');
    setLoading(false);

    // Clear localStorage liên quan đến ZaloPay khi vào trang mới
    localStorage.removeItem('last_zalopay_qr');
    localStorage.removeItem('last_zalopay_amount');
    localStorage.removeItem('last_zalopay_orderId');
    localStorage.removeItem('last_zalopay_order_url');

    // Clear flag thanh toán thành công khi vào trang mới (trừ khi đang quay lại từ OrderSuccessPage)
    if (!localStorage.getItem('zalopay_payment_completed')) {
      localStorage.removeItem('zalopay_payment_completed');
    }

    const now = new Date();
    const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    // Kết hợp Date.now() và random để đảm bảo không trùng
    const newAppTransId = `${yymmdd}_${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setAppTransId(newAppTransId);
  }, []);

  // Polling để kiểm tra trạng thái thanh toán
  useEffect(() => {
    if (zalopayInfo?.order_url && appTransId) {
      console.log('🔄 Bắt đầu polling trạng thái thanh toán cho appTransId:', appTransId);

      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/v1/orders/status?appTransId=${appTransId}`);
          const data = await response.json();

          console.log('📊 Polling result:', data);

          if (data.success && data.isPaid) {
            console.log('✅ Thanh toán thành công, chuyển sang OrderSuccessPage');
            console.log('🔍 appTransId being passed:', appTransId);
            clearInterval(interval);
            setPollingInterval(null);

            // Clear tất cả state trước khi chuyển trang
            setZaloPayInfo(null);
            setOrderId('');
            setAppTransId('');
            setError('');
            setLoading(false);

            // Clear localStorage liên quan đến ZaloPay
            localStorage.removeItem('last_zalopay_qr');
            localStorage.removeItem('last_zalopay_amount');
            localStorage.removeItem('last_zalopay_orderId');
            localStorage.removeItem('last_zalopay_order_url');

            // Set flag để đánh dấu đã thanh toán thành công
            localStorage.setItem('zalopay_payment_completed', 'true');

            // Chuyển sang OrderSuccessPage
            navigate('/order-success', {
              state: {
                appTransId: appTransId,
                paymentMethod: 'zalopay',
              },
            });
          }
        } catch (error) {
          console.error('❌ Lỗi polling:', error);
        }
      }, 3000); // Poll mỗi 3 giây

      setPollingInterval(interval);

      // Cleanup khi component unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [zalopayInfo, appTransId, navigate]);

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const orderNumber = state.orderNumber; // lấy orderNumber thật từ state

  // Kiểm tra URL parameters để tự động redirect khi ZaloPay redirect về
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const appTransIdFromUrl = urlParams.get('appTransId') || urlParams.get('app_trans_id');
    const returnCode = urlParams.get('return_code');

    // Nếu có appTransId từ URL (ZaloPay redirect về), tự động chuyển đến OrderSuccessPage
    if (appTransIdFromUrl && returnCode === '1') {
      console.log('✅ ZaloPay redirect về với appTransId:', appTransIdFromUrl);

      // Clear tất cả state trước khi chuyển trang
      setZaloPayInfo(null);
      setOrderId('');
      setAppTransId('');
      setError('');
      setLoading(false);

      // Clear localStorage liên quan đến ZaloPay
      localStorage.removeItem('last_zalopay_qr');
      localStorage.removeItem('last_zalopay_amount');
      localStorage.removeItem('last_zalopay_orderId');
      localStorage.removeItem('last_zalopay_order_url');

      // Set flag để đánh dấu đã thanh toán thành công
      localStorage.setItem('zalopay_payment_completed', 'true');

      // Chuyển đến OrderSuccessPage với appTransId
      navigate('/order-success', {
        state: {
          appTransId: appTransIdFromUrl,
          paymentMethod: 'zalopay',
        },
      });
    }
  }, [navigate]);

  // Khi tạo QR ZaloPay, chỉ gọi API tạo QR, không tạo đơn hàng trong DB
  useEffect(() => {
    if (!appTransId || !totalAmount || totalAmount <= 0) return;

    console.log('🔍 Debug - User:', user);
    console.log('🔍 Debug - AppTransId:', appTransId);
    console.log('🔍 Debug - TotalAmount:', totalAmount);

    let usedOrderId = '';
    if (orderNumber) {
      usedOrderId = String(orderNumber);
    } else {
      usedOrderId = String(Date.now()) + Math.floor(Math.random() * 10000);
      if (!zalopayInfo?.qrcode && !zalopayInfo?.order_url) {
        setError('⚠️ Không có orderNumber thực tế, mã QR sẽ không đối soát được đơn hàng!');
      }
    }
    setOrderId(usedOrderId);
    setLoading(true);

    let deliveryAddressObj: any = null;
    if (orderType === 'pickup' && store && store.address && store.name) {
      deliveryAddressObj = { address: store.address, storeName: store.name };
    } else if (typeof deliveryAddress === 'object' && deliveryAddress?.address) {
      deliveryAddressObj = deliveryAddress;
    } else if (typeof deliveryAddress === 'string' && deliveryAddress) {
      deliveryAddressObj = { address: deliveryAddress };
    }

    const payload = {
      amount: totalAmount,
      userId: user?.id || 'test_user_123',
      items: items,
      note: state.note || 'Đơn hàng qua ZaloPay',
      deliveryAddress: deliveryAddressObj,
      userPhone: user?.phoneNumber || user?.phone_number || '',
      userName: user?.name || '',
      type: orderType,
      pickupTime: state.pickupTime,
      orderId: usedOrderId,
      appTransId: appTransId,
      description: `Thanh toán đơn hàng #${usedOrderId}`,
    };

    console.log('🔍 Debug - Payload:', payload);
    console.log('🔍 Debug - deliveryAddress:', deliveryAddressObj);
    console.log('🔍 Debug - pickupTime:', state.pickupTime);
    console.log('🔍 Debug - orderType:', orderType);

    fetch('/api/v1/zalopay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('API trả về lỗi: ' + res.status);
        return res.json();
      })
      .then(data => {
        if (data?.qrcode && data?.return_code === 1) {
          setZaloPayInfo(data);
          setLoading(false);
          localStorage.setItem('last_zalopay_qr', data.qrcode);
          localStorage.setItem('last_zalopay_amount', String(totalAmount));
          localStorage.setItem('last_zalopay_orderId', usedOrderId);
        } else if (data?.order_url && data?.return_code === 1) {
          setZaloPayInfo(data);
          setLoading(false);
          localStorage.setItem('last_zalopay_order_url', data.order_url);
          localStorage.setItem('last_zalopay_amount', String(totalAmount));
          localStorage.setItem('last_zalopay_orderId', usedOrderId);

          // ✅ Chỉ lưu order_url, không tự động redirect
          console.log('🔗 Order URL received:', data.order_url);
          // Không tự động redirect, chỉ hiển thị nút cho user bấm
        } else {
          if (!zalopayInfo?.qrcode && !zalopayInfo?.order_url) {
            setError(data?.return_message || 'Không thể tạo mã QR ZaloPay.');
          }
          setLoading(false);
        }
      })
      .catch(err => {
        if (!zalopayInfo?.qrcode && !zalopayInfo?.order_url) {
          setError('Không thể tạo mã QR ZaloPay: ' + (err?.message || err));
        }
        setLoading(false);
      });
    // eslint-disable-next-line
  }, [totalAmount, orderNumber, appTransId, user]);

  // Đếm ngược thời gian giao dịch
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // useEffect kiểm tra trạng thái đơn hàng bằng appTransId (vòng lặp) đã bị loại bỏ để tránh gọi liên tục khi chưa có đơn hàng trong DB

  const appId = import.meta.env.VITE_ZP_APP_ID || '2554';

  // Thêm hàm gọi tạo đơn hàng khi user xác nhận đã thanh toán
  // Xoá hàm handleCreateOrder vì không còn dùng cho flow ZaloPay

  // Thêm hàm xác nhận đã thanh toán, chỉ gọi API /orders/complete
  const handleCompleteOrder = async () => {
    try {
      // Lấy userId từ state hoặc localStorage (tùy app lưu ở đâu)
      const userId = user?.id || localStorage.getItem('userId');
      if (!userId) {
        setError('Không tìm thấy userId. Vui lòng đăng nhập lại!');
        return;
      }
      const res = await fetch('/api/v1/orders/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi xác nhận thanh toán');
      // Lấy lại thông tin đơn hàng theo orderId để lấy đúng order_number
      const orderDetail = await getOrderDetail(data.orderId);
      alert('Đã xác nhận thanh toán!');
      navigate('/order-success', { state: { order: orderDetail } });
    } catch (err) {
      setError('Có lỗi khi xác nhận thanh toán.');
    }
  };

  // Khi bấm Thanh toán, gửi lại đúng appTransId này lên backend để tạo đơn hàng
  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setLoading(true);
    setError('');
    try {
      const zpTransToken = zalopayInfo?.zp_trans_token || zalopayInfo?.order_token || '';
      const payload = {
        userId: user?.id,
        orderItems: { items },
        totalAmount,
        type: orderType,
        deliveryAddress: orderType === 'delivery' ? { address: deliveryAddress } : { address: store.address, storeName: store.name },
        note: '',
        paymentMethod: 'zalopay',
        status: 'pending',
        appTransId,
        zpTransToken,
      };
      // Gọi API tạo đơn hàng (chỉ khi bấm Thanh toán)
      const orderRes = await createOrder(payload);
      clearCart();
      navigate('/order-success', { state: { order: orderRes } });
    } catch (err) {
      setError('Có lỗi khi lưu đơn hàng sau thanh toán.');
    } finally {
      setLoading(false);
      setIsProcessing(false);
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
              {zalopayInfo && (
                <>
                  <div className="payment-info-text" style={{ marginTop: 16 }}>
                    <b>Mã giao dịch</b>
                    <div style={{ fontWeight: 600, fontSize: 16, margin: '4px 0' }}>
                      {zalopayInfo?.order_token || zalopayInfo?.zp_trans_token || '[Chưa có]'}
                    </div>
                  </div>
                  <div className="payment-info-text">
                    <b>Nội dung</b>
                    <div style={{ fontWeight: 600, fontSize: 16, margin: '4px 0' }}>ZaloPay demo</div>
                  </div>
                </>
              )}
              <div style={{ marginTop: 12, fontSize: 15, color: '#555', background: '#f8f8f8', padding: 8, borderRadius: 8 }}>
                Giao dịch kết thúc trong{' '}
                <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                  {String(Math.floor(countdown / 60)).padStart(2, '0')}
                </span>{' '}
                :{' '}
                <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                  {String(countdown % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="payment-info-right">
            <div className="payment-info-block" style={{ textAlign: 'center' }}>
              <div className="payment-info-title" style={{ fontSize: 22, marginBottom: 16 }}>
                Quét QR để thanh toán
              </div>
              <div style={{ background: '#f4f7fb', borderRadius: 16, padding: 24, display: 'inline-block', minWidth: 320 }}>
                {loading ? (
                  <div>Đang tạo mã QR ZaloPay...</div>
                ) : zalopayInfo?.qrcode && zalopayInfo?.return_code === 1 ? (
                  <img src={zalopayInfo.qrcode} alt="QR Code ZaloPay" style={{ width: 200, height: 200, margin: '0 auto 16px', display: 'block' }} />
                ) : zalopayInfo?.order_url && zalopayInfo?.return_code === 1 ? (
                  <QRCodeCanvas value={zalopayInfo.order_url} size={200} style={{ margin: '0 auto 16px', display: 'block' }} />
                ) : zalopayInfo?.return_message ? (
                  <div style={{ color: 'red', fontWeight: 600 }}>{zalopayInfo.return_message}</div>
                ) : error ? (
                  <div style={{ color: 'red', fontWeight: 600 }}>{error}</div>
                ) : (
                  <div style={{ color: 'red', fontWeight: 600 }}>
                    Không thể tạo mã QR ZaloPay. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                  </div>
                )}
                {/* Removed the checkCount >= maxCheckCount message as it's no longer needed */}
                <div style={{ marginTop: 8, fontWeight: 500, color: '#333' }}>
                  Ngân hàng thụ hưởng: VietCapitalBank
                  <br />
                  <span style={{ fontWeight: 700 }}>ZLPDEMO</span>
                  <br />
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
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      background: '#eee',
                      borderRadius: '50%',
                      display: 'inline-block',
                      textAlign: 'center',
                      lineHeight: '32px',
                      fontWeight: 600,
                    }}
                  >
                    +34
                  </span>
                </div>
                <div style={{ marginTop: 12 }}>
                  <a href="#" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>
                    Hướng dẫn thanh toán
                  </a>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayPaymentPage;
