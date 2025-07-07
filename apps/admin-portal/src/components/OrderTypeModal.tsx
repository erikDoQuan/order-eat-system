import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: 'delivery' | 'pickup') => void;
}

const OrderTypeModal: React.FC<Props> = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.3)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#fff', borderRadius:12, padding:32, minWidth:400, maxWidth:600, boxShadow:'0 2px 16px rgba(0,0,0,0.15)'}}>
        <h2 style={{marginBottom:8}}>Hình thức đặt hàng</h2>
        <p style={{marginBottom:16}}>Quý khách vui lòng lựa chọn phương thức đặt hàng phù hợp.<br/>Quý khách có thể chọn Đặt giao hàng tận nơi hoặc Đặt đến lấy trực tiếp tại chi nhánh nhà hàng gần nhất.</p>
        <div style={{display:'flex', gap:24, marginBottom:24}}>
          <div onClick={()=>onSelect('delivery')} style={{flex:1, border:'2px solid #16a34a', borderRadius:8, padding:16, cursor:'pointer', background:'#f6fff8'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <img src="https://static.thepizzacompany.vn/images/web/order-delivery.png" alt="Đặt giao hàng" style={{width:48, height:48}}/>
              <b style={{fontSize:18, color:'#166534'}}>Đặt giao hàng</b>
            </div>
            <div style={{marginTop:8, fontSize:15}}>
              Giao hàng nhanh trong phạm vi giao hàng của nhà hàng. Phụ thu phí giao hàng từ <span style={{color:'#dc2626', fontWeight:600}}>25,000đ</span> với tất cả các đơn đặt hàng qua Website hoặc Hotline <b>19006066</b>.
            </div>
          </div>
          <div onClick={()=>onSelect('pickup')} style={{flex:1, border:'2px solid #ccc', borderRadius:8, padding:16, cursor:'pointer', background:'#fff'}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <img src="https://static.thepizzacompany.vn/images/web/order-pickup.png" alt="Đặt đến lấy" style={{width:48, height:48}}/>
              <b style={{fontSize:18, color:'#166534'}}>Đặt đến lấy</b>
            </div>
            <div style={{marginTop:8, fontSize:15}}>
              Nhận đơn hàng của bạn tại <b>Nhà hàng The Pizza Company</b>
            </div>
          </div>
        </div>
        <div style={{textAlign:'right'}}>
          <button onClick={onClose} style={{padding:'8px 20px', borderRadius:6, border:'none', background:'#16a34a', color:'#fff', fontWeight:600, fontSize:16, cursor:'pointer'}}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default OrderTypeModal; 