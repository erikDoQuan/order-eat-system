import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import FlagUK from '../../../../packages/react-web-ui-shadcn/src/components/icons/flag-en';
import FlagVN from '../../../../packages/react-web-ui-shadcn/src/components/icons/flag-vn';

const LANGS = [
  { code: 'en-us', icon: <FlagUK width={24} />, alt: 'English' },
  { code: 'vi-vn', icon: <FlagVN width={24} />, alt: 'Tiếng Việt' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const current = LANGS.find(l => l.code === locale) || LANGS[1];
  const other = LANGS.find(l => l.code !== locale) || LANGS[0];

  if (!other) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <span onClick={() => setLocale(other.code)} title={other.alt} style={{ display: 'flex', alignItems: 'center' }}>
        {other.icon}
      </span>
    </div>
  );
} 