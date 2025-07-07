import React, { createContext, useContext, useEffect, useState } from 'react';
import i18n from '../i18n';

const LANGUAGE_KEY = 'locale';
const DEFAULT_LOCALE = 'vi-vn';

interface LanguageContextProps {
  locale: string;
  setLocale: (locale: string) => void;
}

const LanguageContext = createContext<LanguageContextProps>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LOCALE;
  });

  const setLocale = (newLocale: string) => {
    setLocaleState(newLocale);
    localStorage.setItem(LANGUAGE_KEY, newLocale);
    i18n.changeLanguage(newLocale === 'en-us' ? 'en' : 'vi');
  };

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY);
    if (stored && stored !== locale) setLocaleState(stored);
    i18n.changeLanguage((stored || locale) === 'en-us' ? 'en' : 'vi');
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}; 