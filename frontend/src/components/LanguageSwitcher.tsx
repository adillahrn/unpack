import { useTranslation } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact';
}

export default function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={`inline-flex p-1 rounded-full bg-surface-container-low border border-outline-variant/30 ${className}`}>
      <button
        onClick={() => setLocale('id')}
        className={`flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          locale === 'id'
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
        }`}
        title="Bahasa Indonesia"
      >
        ID
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
          locale === 'en'
            ? 'bg-primary text-on-primary shadow-sm'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}
