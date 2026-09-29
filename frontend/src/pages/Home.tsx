import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export default function Home() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sampleInput, setSampleInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isEmptyError, setIsEmptyError] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectTag = (full: string, tagLabel: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      const isSelecting = !next.has(full);
      if (isSelecting) {
        next.add(full);
        setSampleInput((curr) => {
          setIsEmptyError(false);
          if (!curr.trim()) return tagLabel;
          if (!curr.includes(tagLabel)) {
            return `${curr.trim()}, ${tagLabel}`;
          }
          return curr;
        });
      } else {
        next.delete(full);
      }
      return next;
    });
  };

  const handleMiniUnpack = () => {
    const trimmed = sampleInput.trim();
    if (!trimmed) {
      setIsEmptyError(true);
      textareaRef.current?.focus();
      setTimeout(() => setIsEmptyError(false), 2000);
      return;
    }

    if (!session) {
      navigate('/login', {
        state: { from: '/unpack', initialText: trimmed },
      });
      return;
    }

    navigate('/unpack', {
      state: { initialText: trimmed },
    });
  };

  const tagPills = [
    { key: 'finals', emoji: '📚', label: t('home.tagFinals', 'Finals Panic') },
    { key: 'sleep', emoji: '😴', label: t('home.tagSleep', 'Sleep Deprived') },
    { key: 'group', emoji: '👥', label: t('home.tagGroup', 'Group Conflict') },
    { key: 'rent', emoji: '💸', label: t('home.tagRent', 'Rent / Money') },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* ─── SECTION 1 · HERO (Freud.ai-inspired) ─── */}
      <section className="relative overflow-hidden zen-ripples pt-8 md:pt-10 pb-14 lg:pb-18">
        {/* Concentric ring decorations */}
        <div className="absolute right-[2%] top-[10%] w-[580px] h-[580px] rounded-full border border-outline-variant/60 pointer-events-none hidden lg:block -z-10" />
        <div className="absolute right-[-4%] top-[2%] w-[720px] h-[720px] rounded-full border border-outline-variant/30 pointer-events-none hidden lg:block -z-10" />
        <div className="absolute right-[-10%] top-[-6%] w-[860px] h-[860px] rounded-full border border-outline-variant/20 pointer-events-none hidden lg:block -z-10" />

        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-7 xl:col-span-7 pt-2 lg:pt-0 max-w-xl">
            {/* Headline */}
            <h1 className="text-[34px] sm:text-[44px] lg:text-[50px] leading-[1.12] font-extrabold tracking-[-0.03em] text-on-surface mb-5">
              {t('home.heroLine1', 'Empathetic Student Mental Health')}{' '}
              <br className="hidden sm:inline" />
              <span className="brush-highlight text-primary relative inline-block">
                {t('home.heroLine2', 'AI Companion')}
              </span>
            </h1>

            {/* Body copy */}
            <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed mb-7 max-w-lg">
              {t(
                'home.heroSubtitle',
                'Step into a world of compassionate care and gentle clarity tailored to university life. Put down the heavy backpack — without guilt, pressure, or streaks.'
              )}
            </p>

            {/* Dual Pill Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/unpack"
                className="inline-flex items-center gap-3 px-7 py-3 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-[14px] font-bold transition-all shadow-lg shadow-primary/30 group"
              >
                <span>{t('home.ctaPrimary', 'Start Unpacking')}</span>
                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: Phone Mockup */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end items-center relative py-2">
            {/* Outer Phone Hardware Chassis (iPhone 9:19.5 ratio) */}
            <div className="relative w-[270px] sm:w-[290px] lg:w-[305px] max-w-[320px] aspect-[9/19.5] max-h-[calc(100vh-200px)] border-[8px] sm:border-[10px] border-neutral-900 bg-neutral-900 rounded-[2.75rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-black/80 flex flex-col shrink-0">
              {/* Phone Glass Screen */}
              <div className="relative w-full h-full bg-surface rounded-[2rem] overflow-hidden flex flex-col select-none">
                {/* Floating Dynamic Island / Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 sm:w-22 h-4 sm:h-4.5 bg-black rounded-full z-30 flex items-center justify-end px-2.5 pointer-events-none shadow-xs">
                  <div className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-800/80" />
                </div>

                {/* Phone Status Bar */}
                <div className="pt-2 px-5 pb-1 flex items-center justify-between text-[10px] font-bold text-on-surface/80 shrink-0 z-20">
                  <span className="tracking-tight">9:41</span>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[12px]">wifi</span>
                    <span className="material-symbols-outlined text-[12px]">battery_full</span>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="px-3.5 py-2 border-b border-outline-variant/40 flex items-center justify-between bg-surface/95 backdrop-blur-xs shrink-0 z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface border border-outline-variant">
                      <span className="material-symbols-outlined text-[14px] text-on-surface">chevron_left</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <h2 className="text-[13px] font-bold tracking-tight text-on-surface">
                        {t('home.phonePaxStatus', 'Pax Companion')}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] p-1 rounded-full">search</span>
                    <span className="material-symbols-outlined text-[16px] p-1 rounded-full">more_horiz</span>
                  </div>
                </div>

                {/* Message Stream — starts naturally from top without empty space */}
                <div className="flex-1 overflow-y-auto p-3.5 pt-4 flex flex-col gap-3 text-[11.5px] sm:text-[12px] leading-relaxed">
                  {/* 1. User message */}
                  <div className="flex items-start justify-end gap-1.5">
                    <div className="max-w-[85%] bg-on-surface text-surface p-2.5 rounded-2xl rounded-tr-xs shadow-xs font-normal">
                      {t('home.chatUser', "\"I've been feeling constantly overwhelmed with deadlines and lost interest in studying...\"")}
                    </div>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] text-on-primary shrink-0 mt-0.5 font-bold">S</div>
                  </div>

                  {/* 2. Pax reply with ONLY 1 quick-reply chip */}
                  <div className="flex items-start gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center shrink-0 mt-0.5">
                      <img src="/unpack_logo.png" alt="Pax" className="w-3.5 h-3.5 object-contain" />
                    </div>
                    <div className="max-w-[88%] space-y-2">
                      <div className="bg-surface-container-lowest text-on-surface p-2.5 rounded-2xl rounded-tl-xs border border-outline-variant/60 font-normal shadow-xs">
                        {t('home.chatPax1', "I hear you. You don't have to carry the whole semester at once. Let's unpack just one small pebble together today.")}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <Link
                          to="/unpack"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container hover:bg-surface-container-high text-primary border border-primary-fixed-dim text-[10.5px] font-bold tracking-wide uppercase transition-colors cursor-pointer"
                        >
                          <span>🎒</span><span>Unpack Thoughts</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* 3. User closing message */}
                  <div className="flex items-start justify-end gap-1.5">
                    <div className="max-w-[85%] bg-on-surface text-surface p-2.5 rounded-2xl rounded-tr-xs shadow-xs font-normal">
                      {t('home.chatPax2', "\"Thank you Pax, already feeling a bit of room to breathe.\"")}
                    </div>
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[9px] text-on-primary shrink-0 mt-0.5 font-bold">S</div>
                  </div>
                </div>

                {/* Input bar in mockup */}
                <div className="p-2.5 bg-surface-container-lowest border-t border-outline-variant/40 flex items-center gap-1.5 shrink-0 z-10">
                  <div className="flex-1 bg-surface-container/60 rounded-full px-3 py-1.5 text-[11px] text-on-surface-variant flex items-center justify-between">
                    <span className="truncate">{t('home.chatPlaceholder', 'Type a messy thought...')}</span>
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant shrink-0 ml-1">mic</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] shadow-xs shrink-0">↑</div>
                </div>

                {/* Home Indicator */}
                <div className="pb-1.5 pt-0.5 flex justify-center bg-surface-container-lowest shrink-0 z-10">
                  <div className="w-24 h-1 bg-neutral-400/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 · EDITORIAL NARRATIVE FLOW ─── */}
      <section className="py-20 lg:py-28 border-t border-outline-variant/60 bg-surface" id="how-it-works">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-12">
          {/* Left-aligned Section Header */}
          <div className="max-w-2xl mb-16 lg:mb-20">
            <span className="text-[12px] font-bold tracking-widest uppercase text-primary block mb-3">
              {t('home.narrativeTag', 'Designed For Cognitive Calm')}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-on-surface leading-tight">
              {t('home.narrativeTitle1', 'How we untangle academic burnout,')}{' '}
              <br className="hidden sm:inline" />
              <span className="italic font-normal font-serif text-on-surface-variant">
                {t('home.narrativeTitle2', 'one quiet moment at a time.')}
              </span>
            </h2>
          </div>

          {/* Chapter 01: Mind Dump */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 border-b border-outline-variant/50">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.ch1Label', '01 / Unfiltered Release')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {t('home.ch1Title', 'The Mind Dump')}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {t(
                  'home.ch1Desc',
                  "Pour out raw, messy worries without worrying about spelling, bullet points, or structure. Pax catches the emotional spillover and untangles the knot for you without judgement."
                )}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t('home.ch1Cta', 'Instant cognitive relief • No formatting needed')}
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 bg-surface-container/60 rounded-3xl p-8 border border-outline-variant/60">
              <div className="space-y-4 font-mono text-sm text-on-surface-variant bg-surface p-6 rounded-2xl border border-outline-variant/40">
                <div className="text-xs uppercase text-on-surface-variant tracking-widest font-sans font-semibold">
                  {t('home.ch1DemoLabel', 'Raw student stream:')}
                </div>
                <p className="text-on-surface font-sans text-base leading-relaxed italic">
                  {t('home.ch1Demo1', '"Neuroscience lab report due Thursday, Haven\'t started section 3, my roommate hasn\'t done the dishes in 4 days and I feel so guilty about staying in bed this morning..."')}
                </p>
                <div className="h-px bg-outline-variant/60 my-4" />
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-primary font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t('home.ch1DemoResult', 'Pax categorized into: 1 Urgent • 1 Personal • 1 Let Go')}
                  </span>
                  <span className="text-on-surface-variant">{t('home.ch1DemoSafe', 'Categorized safely')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 02: Pax Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 border-b border-outline-variant/50">
            <div className="lg:col-span-5 lg:order-2 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.chChatLabel', '02 / Gentle Companion')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {t('home.chChatTitle', 'Pax Chat')}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {t(
                  'home.chChatDesc',
                  'Unlike the one-way release of Mind Dump, Pax Chat is a warm, two-way dialogue. Ready whenever you need via the floating button, Pax offers a caring ear, gentle perspective, and non-judgmental comfort whenever you feel overwhelmed.'
                )}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t('home.chChatCta', 'Always Available • Judgment-Free Listening')}
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 bg-surface-container/60 rounded-3xl p-6 sm:p-8 border border-outline-variant/60">
              <div className="bg-surface rounded-2xl p-5 sm:p-6 border border-outline-variant/40 space-y-4 shadow-xs">
                {/* Header card mini */}
                <div className="flex items-center justify-between pb-3.5 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center">
                      <img src="/unpack_logo.png" alt="Pax" className="w-4 h-4 object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-on-surface">Pax</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>
                      <span className="text-[10px] text-on-surface-variant">
                        {t('home.chChatActiveCompanion', 'Active Companion')}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!session) {
                        navigate('/login');
                        return;
                      }
                      window.dispatchEvent(new CustomEvent('open-pax-chat'));
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-[11px] font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <span>Try Pax Chat</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Bubble Chat User */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-on-surface text-surface text-xs sm:text-sm p-3.5 rounded-2xl rounded-tr-xs leading-relaxed font-normal shadow-xs">
                    {t('home.chChatUserBubble', '"My mind is completely full, I honestly don\'t feel like I can handle anything today..."')}
                  </div>
                </div>

                {/* Bubble Chat Pax */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center shrink-0 mt-0.5">
                    <img src="/unpack_logo.png" alt="Pax" className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="max-w-[88%] bg-surface-container-lowest text-on-surface text-xs sm:text-sm p-3.5 rounded-2xl rounded-tl-xs border border-outline-variant/60 leading-relaxed font-normal shadow-xs">
                    {t('home.chChatPaxBubble', '"That\'s completely okay. You don\'t have to jump straight into productivity. Want to share what feels heaviest on your chest right now?"')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 03: Start Here Micro-Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 border-b border-outline-variant/50">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.ch2Label', '03 / Anti-Paralysis Engine')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {t('home.ch2Title', 'Start Here Micro-Steps')}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {t(
                  'home.ch2Desc',
                  "When everything feels like an emergency, nothing gets started. Pax isolates a single 10-minute micro-action so small it feels effortless to begin."
                )}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t('home.ch2Cta', 'Bypasses ADHD paralysis • Zero toxic streaks')}
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 bg-surface-container/60 rounded-3xl p-8 border border-outline-variant/60">
              <div className="bg-surface p-6 rounded-2xl border border-outline-variant/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t('home.ch2PebbleLabel', "Today's Single Pebble")}
                  </span>
                  <h4 className="text-lg font-bold text-on-surface">
                    {t('home.ch2Step1', 'Open Lab Report & Write Title + Headings')}
                  </h4>
                  <p className="text-xs text-on-surface-variant">
                    {t('home.ch2StepMeta', 'Estimated effort: 8 minutes • Low friction')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-2xl font-mono font-bold text-on-surface">09:59</span>
                  <Link
                    to="/unpack"
                    className="px-5 py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold hover:bg-on-primary-fixed-variant transition-colors shadow-md shadow-primary/20"
                  >
                    {t('home.ch2BeginBtn', 'Begin Softly')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 04: The Unwind Sanctuary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12">
            <div className="lg:col-span-5 lg:order-2 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.ch3Label', '04 / Sensory Grounding')}
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
                {t('home.ch3Title', 'The Unwind Sanctuary')}
              </h3>
              <p className="text-on-surface-variant text-base leading-relaxed">
                {t(
                  'home.ch3Desc',
                  'When study overwhelm peaks, step into sensory micro-tools: popping bubble wraps, 60-second synchronized box breathing, or listening to quiet rainy library ambient soundscapes.'
                )}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {t('home.ch3Cta', 'Instant nervous system regulation')}
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 lg:order-1 bg-surface-container/60 rounded-3xl p-8 border border-outline-variant/60">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { emoji: '🫧', title: t('home.unwind1Title', 'Pop Bubbles'), desc: t('home.unwind1Desc', 'Tactile tension release') },
                  { emoji: '🫁', title: t('home.unwind2Title', '60s Breathing'), desc: t('home.unwind2Desc', 'Calms vagus nerve') },
                  { emoji: '🌧️', title: t('home.unwind3Title', 'Rainy Library'), desc: t('home.unwind3Desc', 'Campus lo-fi soundscape') },
                ].map((item, i) => (
                  <Link
                    key={i}
                    to="/unwind"
                    className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 text-center space-y-2 shadow-xs hover:border-primary/50 transition-colors"
                  >
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="font-bold text-sm text-on-surface">{item.title}</div>
                    <div className="text-[11px] text-on-surface-variant">{item.desc}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 · INTERACTIVE SANDBOX ─── */}
      <section className="py-20 lg:py-28 bg-surface-container-high border-t border-outline-variant/60" id="mind-dump">
        <div className="max-w-[860px] mx-auto px-6 text-center">
          <span className="text-xs font-bold tracking-widest uppercase text-primary block mb-3">
            {t('home.sandboxTag', 'Interactive Sandbox')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            {t('home.sandboxTitle', 'Drop one heavy thought right here.')}
          </h2>
          <p className="text-base text-on-surface-variant max-w-lg mx-auto mb-10">
            {t(
              'home.sandboxDesc',
              "Type whatever is sitting in the back of your mind right now. We will never save it without your permission."
            )}
          </p>

          {/* Inline input area */}
          <div
            className={`relative bg-surface rounded-3xl p-6 sm:p-8 border shadow-sm text-left transition-all duration-300 ${
              isEmptyError
                ? 'border-error ring-2 ring-error/30'
                : 'border-outline-variant'
            }`}
          >
            <textarea
              ref={textareaRef}
              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-base sm:text-lg text-on-surface placeholder:text-on-surface-variant/50 resize-none font-sans focus:outline-none"
              placeholder={t(
                'home.sandboxPlaceholder',
                "e.g. My group project partner isn't answering and the pitch deck is due at midnight..."
              )}
              rows={3}
              value={sampleInput}
              onChange={(e) => {
                setSampleInput(e.target.value);
                if (isEmptyError) setIsEmptyError(false);
              }}
            />

            {isEmptyError && (
              <p className="text-xs text-error font-medium mt-2 animate-[fadeIn_0.2s_ease-out]">
                {t('home.sandboxEmptyWarning', 'Tuliskan sesuatu dulu yang ada di pikiranmu')}
              </p>
            )}

            <div className="h-px bg-outline-variant/60 my-5" />

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Quick Tag Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-on-surface-variant mr-1 font-medium">
                  {t('home.feelsLike', 'Feels like:')}
                </span>
                {tagPills.map(({ key, emoji, label }) => {
                  const full = `${emoji} ${label}`;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectTag(full, label)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        selectedTags.has(full)
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/40'
                      }`}
                    >
                      {full}
                    </button>
                  );
                })}
              </div>

              {/* Action button */}
              <button
                onClick={handleMiniUnpack}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary hover:bg-on-primary-fixed-variant text-[13px] font-bold transition-all shrink-0 shadow-md shadow-primary/25 cursor-pointer"
              >
                <span>{t('home.btnUnpackThought', 'Unpack Thought')}</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* ─── SECTION 5 · FINAL GENTLE CTA ─── */}
      <section className="py-20 bg-surface-container/40 border-t border-outline-variant/60 text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-primary to-[#8b5cf6] text-on-primary text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30">
            🎒
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            {t('home.closingTitle', "Ready to put down what you've been carrying?")}
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg mb-8 max-w-md mx-auto leading-relaxed">
            {t(
              'home.closingDesc',
              'Take five quiet minutes right now. Unpack the backpack and breathe freely.'
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/unpack"
              className="px-8 py-3.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-[14px] font-bold transition-all shadow-lg shadow-primary/30"
            >
              {t('home.ctaStart', 'Start Your First Mind Dump →')}
            </Link>
            
          </div>
        </div>
      </section>
    </div>
  );
}
