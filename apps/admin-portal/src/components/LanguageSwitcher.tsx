import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import FlagUK from '../../../../packages/react-web-ui-shadcn/src/components/icons/flag-en';
import FlagVN from '../../../../packages/react-web-ui-shadcn/src/components/icons/flag-vn';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const isEN = locale === 'en-us';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        userSelect: 'none',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.7)',
          border: '1.2px solid #e5e7eb',
          borderRadius: 999,
          padding: 0,
          width: 60,
          height: 30,
          position: 'relative',
          cursor: 'pointer',
          boxShadow: '0 2px 6px #0001',
          transition: 'background 0.2s, border 0.2s',
          gap: 0,
        }}
        onClick={() => setLocale(isEN ? 'vi-vn' : 'en-us')}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.7)')}
      >
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, opacity: isEN ? 0.3 : 1, transition: 'opacity 0.2s' }}>
          <FlagVN width={16} />
        </div>
        <div style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, opacity: isEN ? 1 : 0.3, transition: 'opacity 0.2s' }}>
          <FlagUK width={16} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: isEN ? 30 : 0,
            width: 30,
            height: 30,
            background: '#fff',
            borderRadius: '50%',
            boxShadow: '0 1px 4px #0002',
            transition: 'left 0.2s, box-shadow 0.2s',
            zIndex: 2,
            border: '1.2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isEN ? <FlagUK width={14} /> : <FlagVN width={14} />}
        </div>
      </div>
    </div>
  );
}