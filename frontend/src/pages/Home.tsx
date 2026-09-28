import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';

export default function Home() {
  const { t } = useTranslation();
  const [sampleInput, setSampleInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const selectTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleMiniUnpack = () => {
    if (!sampleInput.trim()) {
      setSampleInput(
        t(
          'home.sandboxSample',
          'Need to study for chem midterms, finish group deck, and get more sleep...'
        )
      );
    }
    setShowFeedback(true);
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
      <section className="relative overflow-hidden zen-ripples pt-12 md:pt-16 pb-20 lg:pb-28">
        {/* Concentric ring decorations */}
        <div className="absolute right-[2%] top-[10%] w-[580px] h-[580px] rounded-full border border-outline-variant/60 pointer-events-none hidden lg:block -z-10" />
        <div className="absolute right-[-4%] top-[2%] w-[720px] h-[720px] rounded-full border border-outline-variant/30 pointer-events-none hidden lg:block -z-10" />
        <div className="absolute right-[-10%] top-[-6%] w-[860px] h-[860px] rounded-full border border-outline-variant/20 pointer-events-none hidden lg:block -z-10" />

        <div className="max-w-[1240px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 xl:col-span-6 pt-4 lg:pt-0 max-w-xl">
            {/* Category Badge */}
            

            {/* Headline */}
            <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] leading-[1.08] font-extrabold tracking-[-0.03em] text-on-surface mb-6">
              {t('home.heroLine1', 'Empathetic Student Mental Health')}{' '}
              <br className="hidden sm:inline" />
              <span className="brush-highlight text-primary relative inline-block">
                {t('home.heroLine2', 'AI Companion')}
              </span>
            </h1>

            {/* Body copy */}
            <p className="text-base sm:text-lg text-on-surface-variant font-normal leading-relaxed mb-9 max-w-lg">
              {t(
                'home.heroSubtitle',
                'Step into a world of compassionate care and gentle clarity tailored to university life. Put down the heavy backpack — without guilt, pressure, or streaks.'
              )}
            </p>

            {/* Dual Pill Actions */}
            <div className="flex flex-wrap items-center gap-4">
              
              <Link
                to="/unpack"
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary text-[14px] font-bold transition-all shadow-lg shadow-primary/30 group"
              >
                <span>{t('home.ctaPrimary', 'Start Unpacking')}</span>
                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs group-hover:translate-x-0.5 transition-transform">→</span>
              </Link>
            </div>

            
          </div>

          {/* Right Hero Column: Phone Mockup */}
          <div className="lg:col-span-6 xl:col-span-6 flex justify-center lg:justify-end relative">
            {/* Outer Phone Frame */}
            <div className="w-full max-w-[370px] sm:max-w-[400px] bg-[#1E1917] p-3 sm:p-3.5 rounded-[46px] shadow-[0_28px_60px_-15px_rgba(35,30,27,0.3)] ring-1 ring-black/10">
              {/* Phone Glass Screen */}
              <div className="bg-surface rounded-[38px] overflow-hidden flex flex-col border border-outline-variant/40 relative">
                {/* Phone Status Bar & Island */}
                <div className="pt-3 px-7 flex items-center justify-between text-[11px] font-bold text-on-surface/80">
                  <span>9:41</span>
                  <div className="w-24 h-4 bg-black rounded-full mx-auto" />
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="material-symbols-outlined text-[13px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[13px]">wifi</span>
                    <span className="material-symbols-outlined text-[13px]">battery_full</span>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="px-5 py-3.5 mt-1 border-b border-outline-variant/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-xs font-bold text-on-surface border border-outline-variant">
                      <span className="material-symbols-outlined text-[16px] text-on-surface">chevron_left</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <h2 className="text-[15px] font-bold tracking-tight text-on-surface">
                        {t('home.phonePaxStatus', 'Pax Companion')}
                      </h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[19px] p-1.5 rounded-full">search</span>
                    <span className="material-symbols-outlined text-[19px] p-1.5 rounded-full">more_horiz</span>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="p-4 sm:p-5 flex flex-col gap-4 text-[13.5px] leading-relaxed">
                  {/* User message 1 */}
                  <div className="flex items-start justify-end gap-2">
                    <div className="max-w-[84%] bg-on-surface text-surface p-3.5 rounded-2xl rounded-tr-sm shadow-sm font-normal">
                      {t('home.chatUser', "\"I've been feeling constantly overwhelmed with deadlines and lost interest in studying...\"")}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary shrink-0 mt-1 font-bold">S</div>
                  </div>

                  {/* Pax reply */}
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs">🎒</span>
                    </div>
                    <div className="max-w-[88%] space-y-2.5">
                      <div className="bg-surface-container-lowest text-on-surface p-3.5 rounded-2xl rounded-tl-sm border border-outline-variant/60 font-normal shadow-xs">
                        {t('home.chatPax1', "I hear you. You don't have to carry the whole semester at once. Let's unpack just one small pebble together today.")}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-primary border border-primary-fixed-dim text-[11px] font-bold tracking-wide uppercase">
                          <span>📞</span><span>10-Min Reset</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-primary border border-primary-fixed-dim text-[11px] font-bold tracking-wide uppercase">
                          <span>📍</span><span>Unpack Thoughts</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User message 2 */}
                  <div className="flex items-start justify-end gap-2 pt-1">
                    <div className="max-w-[82%] bg-on-surface text-surface p-3 rounded-2xl rounded-tr-sm shadow-sm font-normal">
                      {t('home.chatPax2', "\"Thank you Pax, already feeling a bit of room to breathe.\"")}
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-on-primary shrink-0 mt-1 font-bold">S</div>
                  </div>

                  {/* Pax final */}
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-fixed border border-primary-fixed-dim flex items-center justify-center shrink-0 mt-1">
                      <span className="text-xs">🎒</span>
                    </div>
                    <div className="max-w-[82%] bg-surface-container-lowest text-on-surface p-3 rounded-2xl rounded-tl-sm border border-outline-variant/60 shadow-xs">
                      {t('home.chatMicro', 'Always here for you. Take a gentle breath. ✨')}
                    </div>
                  </div>
                </div>

                {/* Input bar in mockup */}
                <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/40 flex items-center gap-2">
                  <div className="flex-1 bg-surface-container/60 rounded-full px-3.5 py-1.5 text-xs text-on-surface-variant flex items-center justify-between">
                    <span>{t('home.chatPlaceholder', 'Type a messy thought...')}</span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">mic</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs shadow-xs">↑</div>
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

          {/* Chapter 02: Start Here Micro-Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12 border-b border-outline-variant/50">
            <div className="lg:col-span-5 lg:order-2 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.ch2Label', '02 / Anti-Paralysis Engine')}
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
            <div className="lg:col-span-7 lg:order-1 bg-surface-container/60 rounded-3xl p-8 border border-outline-variant/60">
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

          {/* Chapter 03: The Unwind Sanctuary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center py-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-mono tracking-widest text-on-surface-variant uppercase">
                {t('home.ch3Label', '03 / Sensory Grounding')}
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
            <div className="lg:col-span-7 bg-surface-container/60 rounded-3xl p-8 border border-outline-variant/60">
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
          <div className="relative bg-surface rounded-3xl p-6 sm:p-8 border border-outline-variant shadow-sm text-left">
            <textarea
              className="w-full bg-transparent border-0 focus:ring-0 p-0 text-base sm:text-lg text-on-surface placeholder:text-on-surface-variant/50 resize-none font-sans focus:outline-none"
              placeholder={t(
                'home.sandboxPlaceholder',
                "e.g. My group project partner isn't answering and the pitch deck is due at midnight..."
              )}
              rows={3}
              value={sampleInput}
              onChange={(e) => {
                setSampleInput(e.target.value);
                setShowFeedback(false);
              }}
            />

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
                      onClick={() => selectTag(full)}
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

            {/* Dynamic Response Slot */}
            {showFeedback && (
              <div className="mt-6 pt-6 border-t border-outline-variant/60 space-y-3 animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    {t('home.paxFeedbackTitle', 'Pax unpacked this for you:')}
                  </span>
                </div>
                <p className="text-base text-on-surface leading-relaxed font-sans italic bg-primary-fixed/40 p-4 rounded-2xl border border-primary-fixed-dim/80">
                  {t(
                    'home.paxFeedbackBody',
                    '"Take a gentle breath. You can\'t control their response time, but you can control your own peace. Your only 10-minute micro-step: write a short outline for slide 1 and take a 5-minute warm water break."'
                  )}
                </p>
              </div>
            )}
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
