import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaTiktok } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import { Category, getAllCategories } from '../services/category.api';

const Footer: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    getAllCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const getStores = () => {
    try {
      const stores = JSON.parse(localStorage.getItem('bcm_stores') || '[]');
      if (Array.isArray(stores) && stores.length > 0) return stores;
    } catch {}
    return [
      {
        id: 1,
        name: 'Bếp của Mẹ - Chi nhánh 1',
        address: '296/29 Lương Định Của, Nha Trang',
        phone: '0909 123 456',
      },
      {
        id: 2,
        name: 'Bếp của Mẹ - Chi nhánh 2',
        address: '01 Nguyễn Trãi, P. Phước Hải, Nha Trang, Khánh Hòa',
        phone: '0909 123 456',
      },
    ];
  };
  const stores = getStores();

  return (
    <footer style={{ background: '#c92a15', color: 'white', padding: '24px 32px 0 32px', marginTop: 32 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 0,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          alignItems: 'flex-start',
        }}
        className="footer-flex-responsive"
      >
        {/* Cột 1: Logo & mô tả (chiếm 2/3) */}
        <div
          className="footer-logo-col"
          style={{
            flex: 2,
            minWidth: 300,
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 0,
            marginLeft: 0,
            paddingLeft: 25,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="/logo.png" alt="Bếp của mẹ logo" style={{ width: 56, height: 56, objectFit: 'contain' }} />
            <span style={{ fontSize: 28, fontWeight: 700, textAlign: 'left', lineHeight: 1 }}>{t('footer_slogan_title')}</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.7, margin: '10px 0 0 0', textAlign: 'left' }}>
            {t('footer_slogan_desc1')}
            <br />
            {t('footer_slogan_desc2')}
          </p>
        </div>

        {/* Cột 2: Liên kết nhanh (danh mục) */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('footer_quick_links')}</h3>
          <ul style={{ fontSize: 15, lineHeight: 2, listStyle: 'none', padding: 0 }}>
            {categories
              .filter(cat => (cat.nameLocalized || cat.name).toLowerCase() !== 'món thử nghiệm' && cat.isActive !== false)
              .map(cat => (
                <li key={cat.id}>
                  <Link to={`/menu?category=${cat.id}`} style={{ color: 'white', textDecoration: 'none' }}>
                    {cat.nameLocalized || cat.name}
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        {/* Cột 3: Chi nhánh + Liên hệ */}
        <div style={{ flex: 1, minWidth: 220, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('footer_branch')}</h3>
            <ul style={{ fontSize: 15, listStyle: 'none', padding: 0, margin: 0 }}>
              {stores.map(store => (
                <li key={store.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FaMapMarkerAlt style={{ fontSize: 16, color: '#fff' }} />
                  <span>{store.address}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ marginTop: 18, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{t('footer_contact')}</h3>
            <ul style={{ fontSize: 15, listStyle: 'none', padding: 0, margin: 0, marginBottom: 10 }}>
              {stores.map(store => (
                <li key={store.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <FaPhoneAlt style={{ fontSize: 15, color: '#fff' }} />
                  <span>{store.phone}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon">
                <FaFacebookF />
              </a>
              <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon">
                <FaInstagram />
              </a>
              <a href="#" style={{ color: 'white', fontSize: 22 }} className="social-icon">
                <FaTiktok />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dòng cuối */}
      <div
        style={{
          marginTop: 16,
          textAlign: 'center',
          fontSize: 14,
          borderTop: '1px solid rgba(255,255,255,0.3)',
          padding: '12px 0 8px 0',
        }}
      >
        &copy; {new Date().getFullYear()} Bếp Của Mẹ. {t('footer_rights')}
      </div>

      {/* CSS responsive & hiệu ứng */}
      <style>{`
        @media (max-width: 900px) {
          .footer-flex-responsive {
            flex-direction: column;
            gap: 12px !important;
          }
          .footer-flex-responsive > div {
            max-width: 100% !important;
          }
          .footer-logo-col {
            padding-left: 8px !important;
            padding-right: 8px !important;
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
