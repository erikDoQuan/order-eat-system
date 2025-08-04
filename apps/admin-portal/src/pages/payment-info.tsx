import React, { useContext } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/order.api';

import '../css/payment-info.css';

const PaymentInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const orderType = state?.orderType || 'pickup';

  // Debug: log thông tin được truyền
  console.log('PaymentInfoPage - state:', state);
  console.log('PaymentInfoPage - store:', state?.store);
  console.log('PaymentInfoPage - customer:', state?.customer);
  const store = state?.store || {
    id: 1,
    name: 'BẾP CỦA MẸ - TP NHA TRANG',
    address: '296/29 Lương Định Của, Xã Vĩnh Ngọc, TP Nha Trang, Khánh Hòa (0337782571)',
    hotline: '0337782571',
  };
  console.log('PaymentInfoPage - final store being used:', store);
  const customer = state?.customer || { name: '', phone: '' };
  const { user } = useContext(AuthContext);
  const { orderItems, dishes } = useCart();
  const items = Array.isArray(state?.items) && state.items.length > 0 ? state.items : orderItems || [];
  // Thêm sizeOptions và toppingDishes, getItemPrice giống CheckoutPage
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const [toppingDishes, setToppingDishes] = React.useState<any[]>([]);
  React.useEffect(() => {
    fetch('/api/v1/categories')
      .then(res => res.json())
      .then(catRes => {
        const categories = catRes.data || [];
        const toppingCat = categories.find((c: any) => (c.nameLocalized || c.name)?.toLowerCase().includes('topping'));
        if (toppingCat) setToppingDishes(dishes.filter(d => d.categoryId === toppingCat.id));
      });
  }, [dishes]);
  const getDish = (dishId: string) => dishes.find(d => d.id === dishId);
  const getItemPrice = (item: any) => {
    const dish = getDish(item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find(s => s.value === item.size)?.price || 0;
    }
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      const topping = toppingDishes.find(t => t.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
    }
    return price;
  };
  // Hàm lấy thông tin món ăn từ dishId
  const getDishInfo = item => {
    const dish = dishes.find(d => d.id === item.dishId);
    return {
      name: item.name || dish?.name || 'Món ăn',
      price: typeof item.price !== 'undefined' ? item.price : dish?.basePrice ? Number(dish.basePrice) : 0,
    };
  };
  const subtotal = state?.subtotal ?? 0;
  const shippingFee = orderType === 'delivery' ? (state?.shippingFee ?? 25000) : 0;
  // Thay thế logic tính giá subtotal, totalAmountDisplay:
  const computedSubtotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);
  const totalAmountDisplay = computedSubtotal + shippingFee;
  function getValidTimes(selectedDate: string) {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const minHour = 9;
    const maxHour = 22;
    let startHour = minHour;
    if (selectedDate === todayStr) {
      if (now.getHours() < minHour) {
        startHour = minHour;
      } else if (now.getHours() >= minHour && now.getHours() < maxHour) {
        startHour = now.getMinutes() > 0 ? now.getHours() + 1 : now.getHours();
        if (startHour > maxHour) return [];
      } else {
        return [];
      }
    }
    const times: string[] = [];
    for (let h = startHour; h <= maxHour; h++) {
      const hh = h.toString().padStart(2, '0');
      times.push(`${hh}:00`);
    }
    return times;
  }
  function getValidDates() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return [format(today), format(tomorrow)];
  }
  const [form, setForm] = React.useState({
    timeType: 'now',
    time: '',
    date: new Date().toISOString().slice(0, 10),
  });
  let deliveryTimeText = '';
  if (orderType === 'delivery') {
    if (form.timeType === 'custom' && form.date && form.time) {
      deliveryTimeText = `Giao lúc: ${form.time} ${form.date.split('-').reverse().join('/')}`;
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const pad = (n: number) => n.toString().padStart(2, '0');
      deliveryTimeText = `Dự kiến giao lúc: ${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} (tối thiểu 30 phút sau khi đặt hàng thành công)`;
    }
  }
  const deliveryAddress =
    orderType === 'delivery'
      ? [state?.address, state?.street, state?.ward, state?.district, state?.province, state?.detail].filter(Boolean).join(', ')
      : `${store.name} (${store.hotline})` || '';

  const [paymentMethod, setPaymentMethod] = React.useState('cod');

  // 1. Thêm hàm handleOrder để gọi createOrder với deliveryAddress là object
  const handleOrder = async () => {
    if (paymentMethod === 'zalopay') {
      // KHÔNG gọi createOrder ở đây, chỉ điều hướng sang ZaloPayPaymentPage
      let deliveryAddressObj;
      if (orderType === 'delivery') {
        deliveryAddressObj = {
          address: [state?.address, state?.street, state?.ward, state?.district, state?.province, state?.detail].filter(Boolean).join(', '),
          phone: state?.phone || customer?.phone || '',
        };
      } else {
        deliveryAddressObj = {
          address: deliveryAddress,
          phone: store.hotline || '',
          storeName: store.name || '',
        };
      }
      console.log('PaymentInfoPage - state?.pickupTime:', state?.pickupTime);
      console.log('PaymentInfoPage - state:', state);
      console.log('PaymentInfoPage - Navigating to ZaloPay with pickupTime:', state?.pickupTime);
      navigate('/zalo-pay-payment', {
        state: {
          items,
          customer,
          store,
          orderType,
          shippingFee,
          deliveryAddress,
          subtotal: computedSubtotal,
          totalAmount: totalAmountDisplay,
          userId: user?.id,
          pickupTime: state?.pickupTime, // Thêm pickupTime
          // Không truyền orderNumber, orderId ở đây
        },
      });
      return;
    }
    let deliveryAddressObj;
    if (orderType === 'delivery') {
      deliveryAddressObj = {
        address: [state?.address, state?.street, state?.ward, state?.district, state?.province, state?.detail].filter(Boolean).join(', '),
        phone: state?.phone || customer?.phone || '',
      };
    } else {
      // Pickup: lưu địa chỉ và số điện thoại cửa hàng
      console.log('PaymentInfoPage - store for pickup:', store);
      deliveryAddressObj = {
        address: deliveryAddress,
        phone: store.hotline || '',
        storeName: store.name || '',
      };
      console.log('PaymentInfoPage - deliveryAddressObj for pickup:', deliveryAddressObj);
    }
    const payload: any = {
      userId: user?.id,
      orderItems: { items: items },
      totalAmount: totalAmountDisplay,
      type: orderType,
      deliveryAddress: deliveryAddressObj,
      note: '', // lấy từ textarea nếu cần
    };

    // Thêm pickupTime cho pickup orders
    if (orderType === 'pickup' && state?.pickupTime) {
      payload.pickupTime = state.pickupTime;
    }
    console.log('PaymentInfoPage - final payload:', payload);
    console.log('PaymentInfoPage - orderType:', orderType);
    console.log('PaymentInfoPage - deliveryAddressObj:', deliveryAddressObj);
    console.log('PaymentInfoPage - deliveryAddress:', deliveryAddress);
    console.log('PaymentInfoPage - store.hotline:', store.hotline);
    console.log('PaymentInfoPage - store.name:', store.name);
    try {
      const orderRes = await createOrder(payload);
      navigate('/order-success', { state: { order: orderRes } });
    } catch (err) {
      alert('Có lỗi khi đặt hàng, vui lòng thử lại!');
    }
  };

  return (
    <div className="payment-info-root">
      <Navbar />
      <div className="payment-info-container">
        <div className="payment-info-grid">
          <div className="payment-info-left">
            <div className="payment-info-block">
              <div className="payment-info-title">Thông tin nhận hàng</div>
              {orderType === 'delivery' ? (
                <>
                  <div className="payment-info-text">
                    <b>Giao hàng đến:</b> <span className="payment-info-highlight">{deliveryAddress}</span>
                  </div>
                  <div className="payment-info-text">
                    <b>Khách hàng:</b> {state?.name || ''} &nbsp; <b>Điện thoại:</b> {state?.phone || ''}
                  </div>
                  <div className="payment-info-text">
                    <b>Phí giao hàng:</b> {shippingFee.toLocaleString('vi-VN')}đ
                  </div>
                </>
              ) : (
                <>
                  <div className="payment-info-text">
                    Nhận hàng tại: <span className="payment-info-highlight">{deliveryAddress}</span>
                  </div>
                  <div className="payment-info-text">
                    <b>Khách hàng:</b> {state?.customer?.name || customer.name} &nbsp; <b>Điện thoại:</b> {state?.customer?.phone || customer.phone}
                  </div>
                  {state?.pickupTime && (
                    <div className="payment-info-text">
                      <b>Thời gian nhận hàng:</b> <span className="payment-info-highlight">{state.pickupTime}</span>
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="payment-info-block">
              <div className="payment-info-title">Phương thức thanh toán</div>
              <div className="payment-info-options" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                  className={`payment-method-box${paymentMethod === 'cod' ? 'selected' : ''}`}
                  style={{
                    border: paymentMethod === 'cod' ? '2px solid #22c55e' : '1px solid #ddd',
                    borderRadius: 12,
                    padding: 0,
                    cursor: 'pointer',
                    background: '#fff',
                    transition: 'border 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 80,
                    position: 'relative',
                  }}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 16 }}>
                    <span style={{ fontSize: 36 }}>💵</span>
                  </div>
                  <div style={{ flex: 1, padding: '20px 0 20px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>Thanh toán khi nhận hàng</div>
                    <div style={{ color: '#888', marginTop: 4 }}>Trả bằng tiền mặt - đơn hàng dưới 1.000.000đ</div>
                  </div>
                  <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    {paymentMethod === 'cod' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#22c55e',
                          border: '2px solid #22c55e',
                          color: '#fff',
                          fontSize: 18,
                          textAlign: 'center',
                          lineHeight: '22px',
                        }}
                      >
                        ✔
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '2px solid #22c55e',
                          background: '#fff',
                        }}
                      />
                    )}
                  </div>
                </div>
                <div
                  className={`payment-method-box${paymentMethod === 'zalopay' ? 'selected' : ''}`}
                  style={{
                    border: paymentMethod === 'zalopay' ? '2px solid #22c55e' : '1px solid #ddd',
                    borderRadius: 12,
                    padding: 0,
                    cursor: 'pointer',
                    background: '#fff',
                    transition: 'border 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: 80,
                    position: 'relative',
                  }}
                  onClick={() => setPaymentMethod('zalopay')}
                >
                  <div style={{ width: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 16 }}>
                    <img src="/icons8-zalo.svg" alt="ZaloPay" style={{ width: 32, height: 32, objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, padding: '20px 0 20px 16px' }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>ZaloPay</div>
                    <div style={{ color: '#888', marginTop: 4 }}>Thanh toán qua ví ZaloPay hoặc ứng dụng ngân hàng</div>
                  </div>
                  <div style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                    {paymentMethod === 'zalopay' ? (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#22c55e',
                          border: '2px solid #22c55e',
                          color: '#fff',
                          fontSize: 18,
                          textAlign: 'center',
                          lineHeight: '22px',
                        }}
                      >
                        ✔
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-block',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '2px solid #22c55e',
                          background: '#fff',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="payment-info-right">
            <div className="payment-info-block">
              <div className="payment-info-title">Đơn hàng của bạn</div>
              {items.length === 0 ? (
                <div className="payment-info-empty">Chưa có sản phẩm trong giỏ hàng</div>
              ) : (
                <>
                  {items.map((item, idx) => {
                    // const { name, price } = getDishInfo(item);
                    const dish = getDish(item.dishId);
                    const name = item.name || dish?.name || 'Món ăn';
                    const price = getItemPrice(item);
                    return (
                      <div key={idx} className="payment-info-item">
                        <div className="payment-info-item-details">
                          <span className="payment-info-item-name">{name}</span>
                          <span className="payment-info-item-price">{price ? Number(price).toLocaleString('vi-VN') : ''}</span>
                          <span className="payment-info-item-quantity">x{item.quantity}</span>
                        </div>
                        {item.note && (
                          <div className="payment-info-item-note">
                            <span className="payment-info-item-note-label">Ghi chú:</span>
                            {item.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <hr className="payment-info-divider" />
                  <div className="payment-info-total">
                    <span>Tạm tính(x{items.length})</span>
                    <span>{computedSubtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="payment-info-total">
                    <span>Phụ thu</span>
                    <span>0đ</span>
                  </div>
                  <div className="payment-info-total">
                    <span>Giảm giá</span>
                    <span>0đ</span>
                  </div>
                  <div className="payment-info-total">
                    <span>Thuế</span>
                    <span>0đ</span>
                  </div>
                  <div className="payment-info-total">
                    <span>Phí giao hàng</span>
                    <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <hr className="payment-info-divider" />
                  <div className="payment-info-total">
                    <span>Tổng cộng</span>
                    <span>{totalAmountDisplay.toLocaleString('vi-VN')}đ</span>
                  </div>
                </>
              )}
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
                className="payment-info-paybtn"
                onClick={handleOrder}
                style={{
                  background: '#C92A15',
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
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfoPage;
