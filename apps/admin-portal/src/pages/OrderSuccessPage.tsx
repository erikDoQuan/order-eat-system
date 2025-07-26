import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import Navbar from '../components/Navbar';

import '../css/OrderSuccessPage.css';

import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getOrderDetail, getOrderDetailByAppTransId, getOrderDetailByNumber } from '../services/order.api';

function isValidUUID(id: string | undefined | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useContext(AuthContext);
  const [orderNumber, setOrderNumber] = useState<string | number>('...');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Lấy thông tin user từ context và order data
  useEffect(() => {
    console.log('🔍 User context:', user);
    // Ưu tiên lấy từ user context trước
    if (user?.phoneNumber || user?.phone_number) {
      setCustomerPhone(user.phoneNumber || user.phone_number || '');
      console.log('📱 Set phone from user context:', user.phoneNumber || user.phone_number);
    }
    if (user?.address) {
      setDeliveryAddress(user.address);
      console.log('🏠 Set address from user context:', user.address);
    }
  }, [user]);

  // Lấy order từ state nếu có
  const order = location.state?.order;
  // Lấy orderId từ state, order, hoặc query string (ZaloPay redirect)
  const orderIdFromState = location.state?.orderId;
  const orderIdFromOrder = order?.id;
  const orderIdFromQuery = new URLSearchParams(location.search).get('orderId');
  const orderId = orderIdFromState || orderIdFromOrder || orderIdFromQuery || undefined;

  // Lấy appTransId từ order nếu có, fallback sang URL params
  const params = new URLSearchParams(location.search);
  let appTransId = order?.appTransId || order?.app_trans_id || location.state?.appTransId || params.get('appTransId') || params.get('app_trans_id');
  if (appTransId && (!isNaN(Number(appTransId)) || String(appTransId).length < 10)) {
    appTransId = undefined;
  }
  const paymentMethod = order?.paymentMethod || location.state?.paymentMethod || (appTransId ? 'zalopay' : 'cash');

  console.log('🔍 OrderSuccessPage debug:', {
    order: order?.id,
    orderId,
    appTransId,
    locationState: location.state,
    urlParams: Object.fromEntries(params.entries()),
  });

  useEffect(() => {
    clearCart();
    localStorage.removeItem('last_zalopay_order_url');
    localStorage.removeItem('last_zalopay_qr');
    localStorage.removeItem('last_zalopay_amount');
    localStorage.removeItem('last_zalopay_orderId');
  }, []);

  useEffect(() => {
    setError(null);
    setOrderNumber('...');
    // Nếu có order object hợp lệ
    if (order && order.id && isValidUUID(order.id)) {
      setOrderNumber(order.order_number || order.orderNumber || order.id || '...');
      setError(null);
    } else if (orderId && isValidUUID(orderId)) {
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
    } else if (orderId && !isValidUUID(orderId)) {
      setError('Mã đơn hàng không hợp lệ!');
    } else if (appTransId) {
      setLoading(true);
      console.log('🔍 OrderSuccessPage calling API with appTransId:', appTransId);
      import('../services/order.api').then(api => {
        api
          .getOrderDetailByAppTransId(appTransId)
          .then(data => {
            console.log('🔍 API response:', data);
            const orderData = data.data || data;
            console.log('🔍 Order data:', orderData);
            if (orderData && orderData.id && isValidUUID(orderData.id)) {
              setOrderNumber(orderData.order_number || orderData.orderNumber || orderData.id || '...');
              // Lấy thông tin địa chỉ và số điện thoại
              if (orderData.deliveryAddress) {
                const address = typeof orderData.deliveryAddress === 'string' ? orderData.deliveryAddress : orderData.deliveryAddress.address || '';
                // Chỉ set nếu chưa có từ user context
                if (!deliveryAddress) {
                  setDeliveryAddress(address);
                }
              }
              if (orderData.user?.phone) {
                // Chỉ set nếu chưa có từ user context
                if (!customerPhone) {
                  setCustomerPhone(orderData.user.phone);
                }
              } else if (orderData.customerPhone) {
                // Chỉ set nếu chưa có từ user context
                if (!customerPhone) {
                  setCustomerPhone(orderData.customerPhone);
                }
              }
              setError(null);
            } else {
              console.log('❌ Invalid data from API:', orderData);
              setError('Không tìm thấy thông tin đơn hàng từ ZaloPay.');
            }
          })
          .catch(error => {
            console.error('❌ API error:', error);
            setError('Không tìm thấy thông tin đơn hàng từ ZaloPay.');
          })
          .finally(() => setLoading(false));
      });
    } else {
      setError('Không có thông tin đơn hàng.');
    }
  }, [order, orderId, appTransId]);

  // Fallback: nếu appTransId không tìm thấy, thử lấy theo orderNumber từ URL
  useEffect(() => {
    if (!appTransId && !order && !orderId) {
      const params = new URLSearchParams(location.search);
      const orderNumber = params.get('orderNumber');
      if (orderNumber) {
        console.log('🔍 Trying to get order by orderNumber:', orderNumber);
        setLoading(true);
        import('../services/order.api').then(api => {
          api
            .getOrderDetailByNumber(orderNumber)
            .then(data => {
              console.log('🔍 Order by number response:', data);
              const orderData = data.data || data;
              if (orderData && orderData.id && isValidUUID(orderData.id)) {
                setOrderNumber(orderData.order_number || orderData.orderNumber || orderData.id || '...');
                setError(null);
              } else {
                setError('Không tìm thấy đơn hàng theo số đơn hàng.');
              }
            })
            .catch(error => {
              console.error('❌ Order by number error:', error);
              setError('Không tìm thấy đơn hàng theo số đơn hàng.');
            })
            .finally(() => setLoading(false));
        });
      }
    }
  }, [appTransId, order, orderId]);

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

            {/* Hiển thị thông tin địa chỉ và số điện thoại */}
            {/* {(deliveryAddress || customerPhone) && (
              <div
                className="order-success-delivery-info"
                style={{
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  margin: '16px 0',
                  border: '1px solid #e9ecef',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>ĐỊA CHỈ NHẬN HÀNG</div>
                {deliveryAddress && (
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Địa chỉ:</strong> {deliveryAddress}
                  </div>
                )}
                {customerPhone && (
                  <div>
                    <strong>Điện thoại:</strong> {customerPhone}
                  </div>
                )}
              </div>
            )} */}

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
                  // Ưu tiên order object từ state
                  if (order && order.id && isValidUUID(order.id)) {
                    navigate(`/orders/${order.id}`);
                  }
                  // Nếu không có order object, dùng orderId từ URL hoặc state
                  else if (orderId && isValidUUID(orderId)) {
                    navigate(`/orders/${orderId}`);
                  }
                  // Nếu có appTransId, lấy order từ API trước khi navigate
                  else if (appTransId) {
                    import('../services/order.api').then(api => {
                      api
                        .getOrderDetailByAppTransId(appTransId)
                        .then(data => {
                          const orderData = data.data || data;
                          if (orderData && orderData.id && isValidUUID(orderData.id)) {
                            navigate(`/orders/${orderData.id}`);
                          } else {
                            alert('Không tìm thấy thông tin đơn hàng!');
                          }
                        })
                        .catch(() => {
                          alert('Không tìm thấy thông tin đơn hàng!');
                        });
                    });
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
