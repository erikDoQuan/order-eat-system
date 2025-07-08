import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const OrderTypePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSelect = (type: 'delivery' | 'pickup') => {
    // TODO: Lưu lựa chọn order type nếu cần, ví dụ vào localStorage hoặc context
    navigate('/checkout', { state: { orderType: type } });
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Navbar />

      <div
        style={{
          maxWidth: 1000,
          margin: '32px auto',
          padding: 32,
          borderRadius: 12,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 24 }}>
          Hình thức đặt hàng
        </h2>

        <p style={{ marginBottom: 24, fontSize: 16, lineHeight: 1.6 }}>
          Quý khách vui lòng lựa chọn phương thức đặt hàng phù hợp.
          <br />
          Có thể chọn <b>Giao hàng tận nơi</b> hoặc <b>Tự đến lấy</b> tại cửa hàng
          gần nhất.
        </p>

        <div style={{ display: 'flex', gap: 32 }}>
          {/* Đặt giao hàng */}
          <button
            onClick={() => handleSelect('delivery')}
            style={{
              flex: 1,
              border: '2px solid #16a34a',
              borderRadius: 8,
              padding: 24,
              cursor: 'pointer',
              background: '#f6fff8',
              transition: 'transform 0.15s, box-shadow 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              boxShadow: '0 1px 4px rgba(22,163,74,0.06)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = '0 4px 12px rgba(22,163,74,0.12)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'none';
              el.style.boxShadow = '0 1px 4px rgba(22,163,74,0.06)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src="https://static.thepizzacompany.vn/images/web/order-delivery.png"
                alt="Đặt giao hàng"
                style={{ width: 56, height: 56 }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>
                Đặt giao hàng
              </span>
            </div>
            <span style={{ marginTop: 12, fontSize: 15, textAlign: 'left' }}>
              Giao hàng nhanh trong phạm vi phục vụ của cửa hàng. Phụ thu&nbsp;
              <b>25.000 đ</b> cho mọi đơn qua Website hoặc Hotline&nbsp;
              <b>1900 6066</b>.
            </span>
          </button>

          {/* Đặt đến lấy */}
          <button
            onClick={() => handleSelect('pickup')}
            style={{
              flex: 1,
              border: '2px solid #ccc',
              borderRadius: 8,
              padding: 24,
              cursor: 'pointer',
              background: '#fff',
              transition: 'transform 0.15s, box-shadow 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = 'none';
              el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src="https://static.thepizzacompany.vn/images/web/order-pickup.png"
                alt="Đặt đến lấy"
                style={{ width: 56, height: 56 }}
              />
              <span style={{ fontSize: 20, fontWeight: 700, color: '#166534' }}>
                Đặt đến lấy
              </span>
            </div>
            <span style={{ marginTop: 12, fontSize: 15, textAlign: 'left' }}>
              Nhận đơn tại <b>nhà hàng The Pizza Company</b> và được giảm&nbsp;
              <b>15%</b> trên giá món chính.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTypePage;
