import React from 'react';

export default function BillPrintPage() {
  const params = new URLSearchParams(window.location.search);
  const customer = params.get('customer');
  let items: any[] = [];
  let itemsError = false;
  let itemsErrorMsg = '';
  try {
    const itemsRaw = params.get('items') || '[]';
    items = JSON.parse(decodeURIComponent(itemsRaw));
    if (!Array.isArray(items)) {
      itemsError = true;
      itemsErrorMsg = 'items không phải là mảng!';
    }
  } catch (e) {
    itemsError = true;
    itemsErrorMsg = 'Lỗi parse items: ' + (e instanceof Error ? e.message : String(e));
  }
  const totalRaw = params.get('total');
  const total = Number(totalRaw);
  const totalError = totalRaw === null || totalRaw === '' || isNaN(total);
  const customerAddress = params.get('customerAddress');
  const customerPhone = params.get('customerPhone');
  const date = params.get('date');
  const paymentMethod = params.get('paymentMethod');
  let paymentMethodDisplay = 'Không rõ';
  if (paymentMethod === 'zalopay') paymentMethodDisplay = 'ZaloPay';
  else if (paymentMethod === 'cash') paymentMethodDisplay = 'Tiền mặt';

  // Debug log
  console.log('BillPrintPage debug:', {
    customer,
    items,
    itemsError,
    itemsErrorMsg,
    totalRaw,
    total,
    totalError,
    customerAddress,
    customerPhone,
    date,
  });

  if (itemsError) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
        Dữ liệu hóa đơn không hợp lệ!
        <br />
        {itemsErrorMsg}
      </div>
    );
  }
  if (totalError) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>
        Tổng tiền không hợp lệ!
        <br />
        totalRaw: {String(totalRaw)}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>HÓA ĐƠN THANH TOÁN</h2>
      <div>
        Khách hàng: <b>{customer}</b>
      </div>
      <div>Địa chỉ: {customerAddress}</div>
      <div>Điện thoại: {customerPhone}</div>
      <div>Ngày: {date}</div>
      <table border={1} cellPadding={8} style={{ width: '100%', marginTop: 20 }}>
        <thead>
          <tr>
            <th>Tên món</th>
            <th>Số lượng</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={idx}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>{Number(item.price).toLocaleString('vi-VN')}đ</td>
              <td>{(item.quantity * item.price).toLocaleString('vi-VN')}đ</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{ textAlign: 'right', marginTop: 20 }}>Tổng cộng: {total.toLocaleString('vi-VN')}đ</h3>
      {(paymentMethod === 'zalopay' || paymentMethod === 'cash') && (
        <div style={{ fontWeight: 'bold', marginTop: 8, fontSize: 20, textAlign: 'left' }}>
          {paymentMethod === 'zalopay'
            ? `Chuyển khoản (zalopay): ${total.toLocaleString('vi-VN')} VND`
            : `Tiền mặt: ${total.toLocaleString('vi-VN')} VND`}
        </div>
      )}
    </div>
  );
}
