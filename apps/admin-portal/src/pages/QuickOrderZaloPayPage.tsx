import React, { useContext, useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useLocation, useNavigate } from 'react-router-dom';

import AdminSidebar from '../components/AdminSidebar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllDishes } from '../services/dish.api';

import '../css/zalo-pay-payment-page.css';

const QuickOrderZaloPayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { clearCart, fetchCart } = useCart();
  const state = (location.state as any) || {};

  const items = state.items || [];
  const customer = state.customer || { name: '', phone: '' };
  const store = state.store || { name: 'Mua tại cửa hàng', address: 'Không rõ địa chỉ' };
  const orderType = state.orderType || 'pickup';
  const totalAmount = state.totalAmount || 0;
  const pickupTime = state.pickupTime;

  const [dishes, setDishes] = useState<any[]>([]);
  const [zalopayInfo, setZaloPayInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(15 * 60); // 15 phút
  const [appTransId, setAppTransId] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  // Hàm lấy phụ phí size
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];

  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId || item.id);
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

  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);
  const finalTotal = totalAmount > 0 ? totalAmount : subtotal;

  // Tạo appTransId mới khi load
  useEffect(() => {
    localStorage.removeItem('zalopay_payment_completed');
    const now = new Date();
    const yymmdd = `${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = Date.now().toString().slice(-6); // 6 digits from timestamp
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0'); // 3 random digits
    const newAppTransId = `${yymmdd}${timestamp}${randomNum}`; // 17 characters: yymmdd + 6 timestamp + 3 random
    setAppTransId(newAppTransId);
  }, []);

  // Tạo orderId ngắn hơn
  useEffect(() => {
    if (!appTransId || finalTotal <= 0) return;

    const timestamp = Date.now().toString().slice(-8); // 8 digits from timestamp
    const randomNum = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0'); // 4 random digits
    const orderId = `${timestamp}${randomNum}`; // 12 characters total
    setOrderId(orderId);
    setLoading(true);

    const deliveryAddressObj =
      orderType === 'pickup'
        ? {
            address: store.address,
            storeName: store.name,
            phone: customer.phone,
          }
        : {
            address: 'Mua trực tiếp tại cửa hàng',
            phone: customer.phone,
          };

    const payload = {
      amount: finalTotal,
      userId: user?.id || 'admin_user',
      items: items.map(item => {
        // Ưu tiên lấy dishId từ item, nếu không có thì lấy từ item.id
        const dishId = item.dishId || item.id;
        const dish = getDish(dishId);
        let price = 0;
        if (dish && dish.basePrice) price = Number(dish.basePrice);
        else if (typeof item.price === 'number') price = Number(item.price);
        else price = getItemPrice(item);
        return {
          id: dishId,
          dishId: dishId,
          name:
            (dish && dish.name) || (item.dishSnapshot && item.dishSnapshot.name) || (item.dish && item.dish.name) || item.name || 'Không rõ tên món',
          quantity: item.quantity,
          price,
          basePrice: item.basePrice || price,
        };
      }),
      note: 'Don hang nhanh',
      deliveryAddress: deliveryAddressObj,
      userPhone: customer.phone || '',
      userName: customer.name || '',
      type: orderType,
      pickupTime: new Date().toISOString().slice(0, 19).replace('T', ' '), // Format: "2025-08-04 11:26:52" (19 chars)
      orderId,
      appTransId,
      description: `Thanh toan don hang nhanh #${orderId}`,
    };

    console.log('🔍 Debug - Payload:', payload);
    console.log('🔍 Debug - appTransId length:', appTransId.length);
    console.log('🔍 Debug - orderId length:', orderId.length);
    console.log('🔍 Debug - appTransId:', appTransId);
    console.log('🔍 Debug - orderId:', orderId);
    console.log('🔍 Debug - zalopayInfo:', zalopayInfo);

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
        console.log('🔍 ZaloPay response:', data);
        console.log('🔍 ZaloPay return_code:', data?.return_code);
        console.log('🔍 ZaloPay return_message:', data?.return_message);
        console.log('🔍 ZaloPay qrcode:', data?.qrcode);
        console.log('🔍 ZaloPay order_url:', data?.order_url);
        if (data?.qrcode && data?.return_code === 1) {
          setZaloPayInfo(data);
          setLoading(false);
          localStorage.setItem('last_zalopay_qr', data.qrcode);
          localStorage.setItem('last_zalopay_amount', String(finalTotal));
          localStorage.setItem('last_zalopay_orderId', orderId);
        } else if (data?.order_url && data?.return_code === 1) {
          setZaloPayInfo(data);
          setLoading(false);
          localStorage.setItem('last_zalopay_order_url', data.order_url);
          localStorage.setItem('last_zalopay_amount', String(finalTotal));
          localStorage.setItem('last_zalopay_orderId', orderId);
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
  }, [appTransId, finalTotal]);

  // Kiểm tra trạng thái đơn hàng
  useEffect(() => {
    if (!appTransId) return;

    const checkOrderStatus = async () => {
      try {
        const res = await fetch(`/api/v1/orders/status?appTransId=${appTransId}`);
        const data = await res.json();

        console.log('🔍 Checking order status:', data);
        console.log('🔍 isPaid:', data.isPaid);
        console.log('🔍 success:', data.success);
        console.log('🔍 order:', data.order);

        // Chỉ chuyển trang khi thanh toán thực sự thành công
        if (data.success && data.order && data.isPaid) {
          console.log('✅ Payment successful! Clearing cart...');

          // Reset giỏ hàng trước khi chuyển trang
          try {
            clearCart();
            console.log('✅ Cart cleared successfully');

            // Đảm bảo UI được cập nhật
            if (typeof fetchCart === 'function') {
              await fetchCart();
              console.log('✅ Cart UI updated');
            }

            // Thêm delay nhỏ để đảm bảo cart được clear hoàn toàn
            setTimeout(() => {
              console.log('✅ Cart clear completed with delay');
            }, 100);
          } catch (error) {
            console.error('❌ Error clearing cart:', error);
          }

          localStorage.removeItem('last_zalopay_order_url');
          localStorage.removeItem('last_zalopay_qr');
          localStorage.removeItem('last_zalopay_amount');
          localStorage.removeItem('last_zalopay_orderId');
          console.log('✅ LocalStorage cleared');

          // Chuyển đến trang admin success mới
          navigate('/admin/quick-order-success', {
            state: {
              order: data.order,
              appTransId: appTransId,
              orderId: orderId,
              totalAmount: finalTotal,
            },
          });
          console.log('✅ Navigated to success page');
        }
      } catch (error) {
        console.error('❌ Error checking order status:', error);
      }
    };

    const interval = setInterval(checkOrderStatus, 3000); // Kiểm tra mỗi 3 giây
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [appTransId, navigate, orderId, finalTotal, clearCart]);

  // Đếm ngược
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="payment-info-root" style={{ minHeight: '100vh', position: 'relative' }}>
      <AdminSidebar />
      <div
        className="payment-info-container"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
          maxWidth: 900,
          zIndex: 10,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="payment-info-grid"
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 18,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            padding: 32,
            display: 'flex',
            gap: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Left */}
          <div className="payment-info-left" style={{ flex: 1, minWidth: 320 }}>
            <div className="payment-info-block" style={{ boxShadow: 'none', border: 'none', background: 'transparent', padding: 0 }}>
              <div className="payment-info-title" style={{ fontSize: 22, marginBottom: 18, color: '#C92A15', textAlign: 'center', letterSpacing: 1 }}>
                Thông tin đơn hàng nhanh
              </div>

              {/* Thông tin khách hàng */}
              <div className="payment-info-text" style={{ fontSize: 17, marginBottom: 12, textAlign: 'left' }}>
                <b>Khách:</b> {customer.name === '' ? 'Khách ngoài' : customer.name}
              </div>
              {/* Nếu là khách ngoài thì không hiện số điện thoại */}

              {/* Thông tin cửa hàng */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ minWidth: 110, fontWeight: 600, fontSize: 17 }}>Cửa hàng:</div>
                <div style={{ fontSize: 17, whiteSpace: 'pre' }}>
                  {store.name === 'Mua trực tiếp tại cửa hàng' && store.address === 'Mua trực tiếp tại cửa hàng'
                    ? 'Mua trực tiếp tại cửa hàng'
                    : `${store.name} - ${store.address}`}
                </div>
              </div>

              {/* Bảng chi tiết đơn hàng nằm ngay dưới khách và cửa hàng */}
              <div style={{ margin: '18px 0 0 0', background: '#f8f9fa', borderRadius: 10, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ background: '#e3e7ed' }}>
                      <th style={{ padding: 6, textAlign: 'left', borderRadius: 6 }}>Tên món</th>
                      <th style={{ padding: 6, textAlign: 'center', borderRadius: 6 }}>Số lượng</th>
                      <th style={{ padding: 6, textAlign: 'right', borderRadius: 6 }}>Đơn giá</th>
                      <th style={{ padding: 6, textAlign: 'right', borderRadius: 6 }}>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const dishId = item.dishId || item.id;
                      const dish = getDish(dishId);
                      const name =
                        (dish && dish.name) ||
                        (item.dishSnapshot && item.dishSnapshot.name) ||
                        (item.dish && item.dish.name) ||
                        item.name ||
                        'Không rõ tên món';
                      const price =
                        dish && dish.basePrice ? Number(dish.basePrice) : typeof item.price === 'number' ? Number(item.price) : getItemPrice(item);
                      const quantity = item.quantity || 1;
                      return (
                        <tr key={idx}>
                          <td style={{ padding: 6 }}>{name}</td>
                          <td style={{ padding: 6, textAlign: 'center' }}>{quantity}</td>
                          <td style={{ padding: 6, textAlign: 'right' }}>{price.toLocaleString('vi-VN')}</td>
                          <td style={{ padding: 6, textAlign: 'right' }}>{(price * quantity).toLocaleString('vi-VN')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, padding: 6, fontSize: 16, background: '#f1f3f7' }}>
                        Tổng cộng:
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#C92A15', padding: 6, fontSize: 17, background: '#f1f3f7' }}>
                        {finalTotal.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  </tfoot>
                </table>
                <div style={{ marginTop: 18, fontSize: 16, textAlign: 'center' }}>
                  Giao dịch kết thúc trong{' '}
                  <span style={{ fontWeight: 700, color: '#C92A15', fontSize: 18 }}>
                    {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div
            className="payment-info-right"
            style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className="payment-info-block"
              style={{
                textAlign: 'center',
                background: '#f4f7fb',
                borderRadius: 18,
                padding: 32,
                minWidth: 320,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div className="payment-info-title" style={{ fontSize: 22, marginBottom: 20, color: '#1976d2' }}>
                Quét QR để thanh toán
              </div>
              <div
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: 24,
                  minWidth: 220,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 220,
                }}
              >
                {loading ? (
                  <div>Đang tạo mã QR ZaloPay...</div>
                ) : zalopayInfo?.order_url ? (
                  <QRCodeCanvas value={zalopayInfo.order_url} size={200} />
                ) : zalopayInfo?.qrcode ? (
                  <img src={zalopayInfo.qrcode} alt="QR Code ZaloPay" style={{ width: 200, height: 200 }} />
                ) : error ? (
                  <div style={{ color: 'red' }}>{error}</div>
                ) : (
                  <div>Không thể tạo mã QR</div>
                )}
              </div>
              <div style={{ marginTop: 24 }}>
                <button
                  onClick={() => navigate(-1)}
                  className="btn-back"
                  style={{
                    padding: '10px 28px',
                    borderRadius: 8,
                    background: '#C92A15',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 16,
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                  }}
                >
                  Quay lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrderZaloPayPage;
