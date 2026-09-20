import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import idLocale from './locales/id.json';
import enLocale from './locales/en.json';

export type Locale = 'id' | 'en';
type Translations = Record<string, string>;

const locales: Record<Locale, Translations> = {
  id: idLocale,
  en: enLocale,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, defaultLocale = 'id' }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('unpack-locale') as Locale;
    if (saved === 'id' || saved === 'en') return saved;
    return defaultLocale;
  });

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('unpack-locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'id' ? 'en' : 'id');
  }, [locale, setLocale]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return locales[locale]?.[key] ?? locales['en']?.[key] ?? locales['id']?.[key] ?? fallback ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}
