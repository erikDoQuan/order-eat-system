import React, { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';

import '../css/AccountPage.css';

export default function AccountPage() {
  const { user } = useContext(AuthContext);
  const phone = user?.phoneNumber || user?.phone_number;
  const address = user?.address || '---';

  return (
    <>
      <div className="account-container">
        <div className="account-sidebar">
          <div className="account-title">
            Tài khoản của
            <div className="account-username">
              {user?.firstName || ''} {user?.lastName || ''}
            </div>
          </div>
          <ul className="account-menu">
            <li className="active">Thông tin khách hàng</li>
            <li>Số địa chỉ</li>
            <li>Lịch sử mua hàng</li>
            <li>Đổi mật khẩu</li>
            <li>Voucher của tôi</li>
          </ul>
        </div>
        <div className="account-main">
          <h1 className="account-main-title">Thông tin chung</h1>
          <div className="account-info-box">
            <div className="account-info-header">
              <span className="account-info-title">THÔNG TIN TÀI KHOẢN</span>
              <button className="account-edit-btn">
                <span style={{ color: '#1976d2', fontSize: 15, marginRight: 4 }}>✎</span> Chỉnh sửa
              </button>
            </div>
            <div className="account-info-content">
              <div>
                <b>Họ và tên</b>
                <span>
                  {user?.firstName || ''} {user?.lastName || ''}
                </span>
              </div>
              <div>
                <b>Số điện thoại</b>
                <span>{phone ? phone : <span className="text-gray-400">Đang tải...</span>}</span>
              </div>
              <div>
                <b>Email</b>
                <span>{user?.email}</span>
              </div>
              {/* <div>
                <b>Địa chỉ</b>
                <span>{address}</span>
              </div> */}
            </div>
          </div>
          <div className="account-orders-box">
            <span className="account-orders-title">ĐƠN HÀNG GẦN ĐÂY NHẤT</span>
            <div className="account-orders-table">
              <div className="account-orders-header">
                <span>Mã</span>
                <span>Sản Phẩm</span>
                <span>Ngày mua</span>
                <span>Tổng tiền</span>
                <span>Trạng thái</span>
              </div>
              {/* Dữ liệu đơn hàng sẽ render ở đây */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
