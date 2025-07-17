import React from 'react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#c92a15', color: 'white', paddingTop: 40, marginTop: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 16px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 32,
        }}
        className="footer-flex-responsive"
      >
        {/* Logo & mô tả */}
        <div style={{ flex: 1, minWidth: 250 }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>Bếp Của Mẹ</h2>
          <p style={{ fontSize: 15, lineHeight: 1.6 }}>
            Hương vị truyền thống, món ngon chuẩn mẹ nấu.<br />
            Phục vụ tận tâm tại Nha Trang.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Liên kết nhanh</h3>
          <ul style={{ fontSize: 15, lineHeight: 2, listStyle: 'none', padding: 0 }}>
            <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Trang chủ</Link></li>
            <li><Link to="/menu" style={{ color: 'white', textDecoration: 'none' }}>Thực đơn</Link></li>
            <li><Link to="/gioi-thieu" style={{ color: 'white', textDecoration: 'none' }}>Giới thiệu</Link></li>
            <li><Link to="/lien-he" style={{ color: 'white', textDecoration: 'none' }}>Liên hệ</Link></li>
          </ul>
        </div>

        {/* Chi nhánh */}
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Chi nhánh</h3>
          <ul style={{ fontSize: 15, lineHeight: 1.8, listStyle: 'none', padding: 0 }}>
            <li>📍 296/29 Lương Định Của, Nha Trang</li>
            <li>📍 01 Nguyễn Trãi, P. Phước Hải, Nha Trang, Khánh Hòa</li>
          </ul>
        </div>

        {/* Thông tin liên hệ & mạng xã hội */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Liên hệ</h3>
          <ul style={{ fontSize: 15, lineHeight: 1.8, listStyle: 'none', padding: 0, marginBottom: 12 }}>
            <li>📞 0909 123 456</li>
            <li>✉️ support@bepcuame.vn</li>
          </ul>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon"><FaFacebookF /></a>
            <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon"><FaInstagram /></a>
            <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon"><FaTiktok /></a>
          </div>
        </div>
      </div>

      {/* Dòng cuối */}
      <div
        style={{
          marginTop: 32,
          textAlign: 'center',
          fontSize: 14,
          borderTop: '1px solid rgba(255,255,255,0.3)',
          padding: '18px 0 10px 0',
        }}
      >
        &copy; {new Date().getFullYear()} Bếp Của Mẹ. All rights reserved.
      </div>

      {/* CSS responsive & hiệu ứng */}
      <style>{`
        @media (max-width: 900px) {
          .footer-flex-responsive {
            flex-direction: column;
          }
        }
        .social-icon:hover {
          color: #ffecb3;
          transform: scale(1.1);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
