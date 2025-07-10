import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../css/OrderTypePage.css';

const OrderTypePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<'delivery' | 'pickup'>('pickup');

  const handleSelect = (type: 'delivery' | 'pickup') => {
    setSelectedType(type);
    localStorage.setItem('orderType', type);
  };

  const handlePay = () => {
    localStorage.setItem('orderType', selectedType);
    if (selectedType === 'delivery') {
      navigate('/delivery-order');
    } else {
      navigate(`/order-info?orderType=${selectedType}`);
    }
  };

  return (
    <div style={{ background: '#f6fff8', minHeight: '100vh' }}>
      <Navbar />
      <div style={{maxWidth: 1000, margin: '32px auto'}}>
        <div className="order-type-header-box" style={{background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.08)', padding: '24px 32px', marginBottom: 32}}>
          <h2 className="order-type-title" style={{marginBottom: 0}}>Hình thức đặt hàng</h2>
          <hr style={{margin: '16px 0 12px 0'}} />
          <div style={{fontSize: 17, marginBottom: 2}}>Quý khách vui lòng lựa chọn phương thức đặt hàng phù hợp.</div>
          <div style={{fontSize: 17}}>Quý khách có thể chọn Đặt giao hàng tận nơi hoặc Đặt đến lấy trực tiếp tại chi nhánh nhà hàng gần nhất.</div>
        </div>
        <div className="order-type-options">
          <div
            className={`order-type-option${selectedType === 'delivery' ? ' active' : ''}`}
            onClick={() => handleSelect('delivery')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              border: `2px solid ${selectedType === 'delivery' ? '#b45309' : '#e5e7eb'}`,
              borderRadius: 12,
              background: selectedType === 'delivery' ? '#f6fff8' : '#fff',
              boxShadow: selectedType === 'delivery' ? '0 2px 8px #b4530922' : 'none',
              marginBottom: 20,
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            }}
          >
            <img src="/shipper-Bepcuame.png" alt="Đặt giao hàng" style={{width:100, height:'auto', flexShrink:0, marginRight:24}}/>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <input
                type="radio"
                name="orderType"
                checked={selectedType === 'delivery'}
                onChange={() => handleSelect('delivery')}
                style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22 }}
              />
              <div style={{ fontSize: 22, fontWeight: 700, color: selectedType === 'delivery' ? '#b45309' : '#222', marginBottom: 8 }}>
                Đặt giao hàng
              </div>
              <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0 16px 0' }} />
              <div style={{ fontSize: 16, color: '#222' }}>
                Giao hàng nhanh trong phạm vi giao hàng của nhà hàng. Phụ thu phí giao hàng từ <span style={{color:'#dc2626', fontWeight:600}}>25,000đ</span> với tất cả các đơn đặt hàng qua Website hoặc Hotline <b>0337782572</b>.
              </div>
            </div>
          </div>
          <div
            className={`order-type-option${selectedType === 'pickup' ? ' active' : ''}`}
            onClick={() => handleSelect('pickup')}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'flex-start',
              border: `2px solid ${selectedType === 'pickup' ? '#b45309' : '#e5e7eb'}`,
              borderRadius: 12,
              background: selectedType === 'pickup' ? '#f6fff8' : '#fff',
              boxShadow: selectedType === 'pickup' ? '0 2px 8px #b4530922' : 'none',
              marginBottom: 20,
              transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
            }}
          >
            <img src="/Bepcuame-cuahang.png" alt="Đặt đến lấy" style={{width:100, height:'auto', flexShrink:0, marginRight:24}}/>
            <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
              <input
                type="radio"
                name="orderType"
                checked={selectedType === 'pickup'}
                onChange={() => handleSelect('pickup')}
                style={{ position: 'absolute', top: 0, right: 0, width: 22, height: 22 }}
              />
              <div style={{ fontSize: 22, fontWeight: 700, color: selectedType === 'pickup' ? '#b45309' : '#222', marginBottom: 8 }}>
                Đặt đến lấy
              </div>
              <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0 16px 0' }} />
              <div style={{ fontSize: 16, color: '#222' }}>
                Nhận đơn hàng của bạn tại <b>Nhà hàng Bếp Của Mẹ</b>
              </div>
            </div>
          </div>
        </div>
        <div className="order-type-btn-group" style={{ display: 'flex', gap: 16, marginTop: 36, justifyContent: 'center' }}>
          <button
            style={{
              background: '#fff',
              color: '#b45309',
              border: '1.5px solid #b45309',
              borderRadius: 8,
              padding: '10px 28px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: 120,
              transition: 'all 0.2s',
              marginRight: 0,
            }}
            onClick={() => navigate('/')}
          >
            ← Tiếp tục mua hàng
          </button>
          <button
            style={{
              background: '#b45309',
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
            onClick={handlePay}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTypePage; 