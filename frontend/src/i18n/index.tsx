import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import idLocale from './locales/id.json';
import enLocale from './locales/en.json';

type Locale = 'id' | 'en';
type Translations = Record<string, string>;

const locales: Record<Locale, Translations> = {
  id: idLocale,
  en: enLocale,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children, defaultLocale = 'id' }: { children: ReactNode; defaultLocale?: Locale }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return locales[locale]?.[key] ?? locales['en']?.[key] ?? fallback ?? key;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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
