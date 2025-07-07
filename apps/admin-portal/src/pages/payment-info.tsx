import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { createOrder } from '../services/order.api';
import '../css/payment-info.css';

const PaymentInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  // fallback nếu không có state (truy cập trực tiếp)
  const store = state?.store || { name: 'Chưa chọn cửa hàng', address: '' };
  const customer = state?.customer || { name: '', phone: '' };

  // Lấy giỏ hàng thực tế
  const { orderItems, cart } = useCart();
  const { dishes } = useCart();
  // Lấy danh sách món ăn từ cart (nếu có)
  const items = orderItems || [];

  // Copy logic tính giá từ CheckoutPage
  const sizeOptions = [
    { value: 'small', price: 0 },
    { value: 'medium', price: 90000 },
    { value: 'large', price: 190000 },
  ];
  const getItemPrice = (item: any) => {
    const dish = (dishes || []).find((d: any) => d.id === item.dishId);
    if (!dish) return 0;
    let price = Number(dish.basePrice) || 0;
    if (item.size) {
      price += sizeOptions.find((s) => s.value === item.size)?.price || 0;
    }
    // Nếu có topping (base là id topping)
    if (item.base && !['dày', 'mỏng'].includes(item.base)) {
      const topping = (dishes || []).find((d: any) => d.id === item.base);
      if (topping) price += Number(topping.basePrice) || 0;
    }
    return price;
  };
  const total = items.reduce(
    (sum, item) => sum + getItemPrice(item) * (item.quantity || 1),
    0
  );

  const getDishName = (dishId: string) => {
    const dish = (dishes || []).find((d: any) => d.id === dishId);
    return dish?.name || dishId;
  };

  const { user } = useContext(AuthContext);

  return (
    <div className="payment-info-root">
      <Navbar />
      <div className="payment-info-container">
        <div className="payment-info-grid">
          <div className="payment-info-left">
            <div className="payment-info-block">
              <div className="payment-info-title">Thông tin nhận hàng</div>
              <div className="payment-info-text">
                Nhận hàng tại: <span className="payment-info-highlight">{store.name}</span>
              </div>
              <div className="payment-info-text">
                {store.address}
              </div>
              <div className="payment-info-text">
                <b>Khách hàng:</b> {customer.name} &nbsp; <b>Điện thoại:</b> {customer.phone}
              </div>
            </div>
            <div className="payment-info-block">
              <div className="payment-info-title">Phương thức thanh toán</div>
              <div className="payment-info-text">
                <div className="payment-info-label">Phương thức thanh toán <span className="payment-info-required">*</span></div>
                <div className="payment-info-options">
                  <label className="payment-info-option">
                    <input type="radio" name="payment" defaultChecked />
                    <span className="payment-info-option-text">Thanh toán khi nhận hàng</span>
                    <span className="payment-info-option-subtext">Trả bằng tiền mặt - đơn hàng dưới 1.000.000đ</span>
                  </label>
                  <label className="payment-info-option">
                    <input type="radio" name="payment" />
                    <span className="payment-info-option-text">ZaloPay</span>
                    <span className="payment-info-option-subtext">Thanh toán qua ví ZaloPay hoặc ứng dụng ngân hàng</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="payment-info-right">
            <div className="payment-info-block">
              <div className="payment-info-title">Voucher/ Code</div>
              <div className="payment-info-input">
                <input placeholder="Nhập mã khuyến mãi của bạn tại đây" />
                <button>Áp dụng</button>
              </div>
            </div>
            <div className="payment-info-block">
              <div className="payment-info-title">Đơn hàng của bạn</div>
              {items.length === 0 ? (
                <div className="payment-info-empty">Chưa có sản phẩm trong giỏ hàng</div>
              ) : (
                <>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="payment-info-item"
                    >
                      <div className="payment-info-item-details">
                        <span className="payment-info-item-name">{getDishName(item.dishId)}</span>
                        <span className="payment-info-item-price">{item.price ? Number(item.price).toLocaleString('vi-VN') : ''}</span>
                        <span className="payment-info-item-quantity">x{item.quantity}</span>
                      </div>
                      {item.note && (
                        <div className="payment-info-item-note">
                          <span className="payment-info-item-note-label">Ghi chú:</span>
                          {item.note}
                        </div>
                      )}
                    </div>
                  ))}
                  <hr className="payment-info-divider" />
                  <div className="payment-info-total">
                    <span>Tạm tính(x{items.length})</span>
                    <span>{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="payment-info-total">
                    <span>Phụ thu</span>
                    <span>0đ</span>
                  </div>
                  {(() => {
                    const note = items.map(item => item.note).filter(Boolean).join(' | ');
                    return null;
                  })()}
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
                    <span>0đ</span>
                  </div>
                  <hr className="payment-info-divider" />
                  <div className="payment-info-total">
                    <span>Tổng tiền</span>
                    <span>{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="order-type-btn-group">
        <button
          onClick={() => navigate(-1)}
          className="order-type-btn order-type-btn-continue"
        >
          <ArrowLeft size={20} style={{marginRight: 6}} />
          Quay lại
        </button>
        <button
          className="order-type-btn order-type-btn-pay"
          onClick={async () => {
            // Xác định orderType: nếu store.name hoặc store.address chứa "lấy tại cửa hàng" thì là pickup, ngược lại là delivery
            let orderType = 'delivery';
            if (
              (store.name && store.name.toLowerCase().includes('lấy tại cửa hàng')) ||
              (store.address && store.address.toLowerCase().includes('lấy tại cửa hàng')) ||
              state?.orderType === 'pickup'
            ) {
              orderType = 'pickup';
            }
            // Tổng hợp ghi chú từ order_items
            const note = items
              .map(item => item.note)
              .filter(Boolean)
              .join(' | ');
            const orderData: any = {
              userId: user?.id,
              orderItems: { items },
              totalAmount: Number(total),
              status: 'pending',
              type: orderType,
              deliveryAddress: store.address,
              note, // tổng hợp từ order_items
            };
            console.log('typeof total:', typeof total, total);
            console.log('typeof orderData.totalAmount:', typeof orderData.totalAmount, orderData.totalAmount);
            console.log('orderData gửi lên:', orderData);
            // Gọi API tạo đơn hàng
            try {
              const res = await createOrder(orderData);
              const orderId = res?.data?.id || res?.data?._id || res?.orderId || 'MÃ ĐƠN';
              navigate('/order-success', { state: { orderId } });
            } catch (err: any) {
              if (err?.response?.data) {
                console.error('Lỗi đặt hàng:', err.response.data);
                alert('Lỗi: ' + JSON.stringify(err.response.data, null, 2));
              } else {
                console.error('Lỗi đặt hàng:', err);
                alert('Lỗi: ' + err.message);
              }
            }
          }}
        >
          Đặt hàng
          <ArrowRight size={20} style={{marginLeft: 6}} />
        </button>
      </div>
    </div>
  );
};

export default PaymentInfoPage; 