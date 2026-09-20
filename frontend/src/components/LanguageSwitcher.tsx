import { useTranslation } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact';
}

export default function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const { locale, setLocale, toggleLocale } = useTranslation();

  if (variant === 'compact') {
    return (
      <div className={`inline-flex p-0.5 rounded-full bg-surface-container-low border border-outline-variant/30 ${className}`}>
        <button
          onClick={() => setLocale('id')}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === 'id'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Bahasa Indonesia"
        >
          ID
        </button>
        <button
          onClick={() => setLocale('en')}
          className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            locale === 'en'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={toggleLocale}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-all cursor-pointer font-label-md text-xs font-semibold border border-outline-variant/30 ${className}`}
      title={locale === 'id' ? 'Switch to English' : 'Beralih ke Bahasa Indonesia'}
      aria-label="Switch Language"
    >
      <span className="material-symbols-outlined text-[16px]">translate</span>
      <span className="font-bold tracking-wider">{locale === 'id' ? 'ID' : 'EN'}</span>
      <span className="text-[10px] opacity-60">({locale === 'id' ? '🇮🇩' : '🇬🇧'})</span>
    </button>
  );
}
