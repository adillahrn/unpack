export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low shadow-[0_-1px_6px_rgba(41,37,36,0.03)] mt-space-xl mb-16 lg:mb-0">
      <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl flex flex-col md:flex-row items-center justify-between gap-gutter text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-space-sm">
          <span className="font-headline-sm text-headline-sm text-on-surface">UNPACK</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            — gentle student decompression &amp; mindful reflections
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-space-md font-label-md text-label-md text-on-surface-variant mt-4 md:mt-0">
          <span className="px-space-sm py-space-xs rounded-full bg-surface-container text-on-surface">
            Campus Edition
          </span>
          <span>© UNPACK Companion. Stay warm.</span>
        </div>
      </div>
    </footer>
  );
}
