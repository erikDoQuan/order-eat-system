import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getAllDishes } from '../services/dish.api';
import '../css/payment-info.css';

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

  // Lấy danh sách món ăn
  const [dishes, setDishes] = useState<any[]>([]);
  useEffect(() => {
    getAllDishes().then(setDishes);
  }, []);

  // Hàm tính giá từng món giống CheckoutPage
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

  // Tính tổng tiền
  const subtotal = items.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0);
  const totalAmount = subtotal + shippingFee;

  return (
    <div className="payment-info-root">
      <Navbar />
      <div className="payment-info-container">
        <div className="payment-info-grid">
          {/* Left: Thông tin đơn hàng */}
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
              {/* Mã giao dịch, nội dung, mã khuyến mãi, đếm ngược: placeholder */}
              <div className="payment-info-text" style={{ marginTop: 16 }}>
                <b>Mã giao dịch</b>
                <div style={{ fontWeight: 600, fontSize: 16, margin: '4px 0' }}>[Chưa có]</div>
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
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>*Áp dụng khi quét QR bằng ứng dụng ngân hàng</div>
              </div>
              <div style={{ marginTop: 12, fontSize: 15, color: '#555', background: '#f8f8f8', padding: 8, borderRadius: 8 }}>
                Giao dịch kết thúc trong <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>14</span> : <span style={{ fontWeight: 600, color: '#C92A15', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>40</span>
              </div>
            </div>
          </div>
          {/* Right: QR và hướng dẫn */}
          <div className="payment-info-right">
            <div className="payment-info-block" style={{ textAlign: 'center' }}>
              <div className="payment-info-title" style={{ fontSize: 22, marginBottom: 16 }}>Quét QR để thanh toán</div>
              <div style={{ background: '#f4f7fb', borderRadius: 16, padding: 24, display: 'inline-block', minWidth: 320 }}>
                {/* Placeholder QR */}
                <div style={{ width: 200, height: 200, background: '#fff', border: '2px dashed #ccc', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#ccc' }}>
                  QR
                </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZaloPayPaymentPage; 