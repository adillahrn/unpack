import { useTranslation } from '@/i18n';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-outline-variant/60 bg-surface py-12 mb-16 lg:mb-0">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="font-extrabold tracking-tight text-lg text-on-surface">UNPACK</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-on-surface-variant">
          <span>{t('footer.copyright', '© UNPACK Companion.')}</span>
        </div>
      </div>
    </footer>
  );
}
