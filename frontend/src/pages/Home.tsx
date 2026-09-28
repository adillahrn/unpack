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
    <div className="flex flex-col w-full bg-brand-cream">
      {/* ─── SECTION 1 · HERO ─── */}
      <section className="relative zen-ripples overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column — Copy */}
            <div className="flex flex-col gap-6 max-w-xl">
              <div className="inline-flex items-center gap-2 w-fit px-4 py-1.5 rounded-full border border-brand-border bg-brand-stone/60 text-brand-muted text-xs tracking-widest uppercase font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-olive" />
                {t('home.heroBadge', 'Student Mental-Health Companion')}
              </div>

              <h1 className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.12] font-extrabold text-brand-dark tracking-tight">
                {t('home.heroLine1', 'Unpack the weight')}{' '}
                <em className="font-serif italic font-medium text-brand-accent not-italic">
                  {t('home.heroLine2', 'you carry')}
                </em>
                <br />
                <span className="brush-highlight">
                  {t('home.heroLine3', 'every single day.')}
                </span>
              </h1>

              <p className="text-brand-muted leading-relaxed text-[17px] max-w-md">
                {t(
                  'home.heroSubtitle',
                  'An empathetic AI companion that turns mental clutter into actionable micro-steps — so you breathe easier, one thought at a time.'
                )}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <Link
                  to="/unpack"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-dark text-white text-sm font-semibold tracking-wide shadow-[0_4px_0_#0f0c0a] hover:translate-y-[1px] hover:shadow-[0_3px_0_#0f0c0a] active:translate-y-[4px] active:shadow-none transition-all"
                >
                  {t('home.ctaPrimary', 'Start Unpacking')}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
                <Link
                  to="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-brand-border text-brand-dark text-sm font-semibold hover:bg-brand-stone/60 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('home.ctaSecondary', 'How it works')}
                </Link>
              </div>

              <p className="text-xs text-brand-muted/70 mt-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                {t('home.heroConfidence', 'No sign-up required to try · 100% private')}
              </p>
            </div>

            {/* Right Column — Phone Mockup + Rings */}
            <div className="relative flex items-center justify-center lg:justify-end">
              {/* Concentric Rings */}
              <div className="absolute w-[340px] h-[340px] md:w-[420px] md:h-[420px] rounded-full border border-brand-border/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute w-[440px] h-[440px] md:w-[540px] md:h-[540px] rounded-full border border-brand-border/25 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute w-[540px] h-[540px] md:w-[660px] md:h-[660px] rounded-full border border-brand-border/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

              {/* Phone */}
              <div className="relative z-10 w-[260px] sm:w-[280px] bg-white rounded-[2.2rem] shadow-2xl border border-brand-border/50 overflow-hidden">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[10px] text-brand-muted">
                  <span className="font-semibold">9:41</span>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
                    <span className="material-symbols-outlined text-[12px]">wifi</span>
                    <span className="material-symbols-outlined text-[12px]">battery_full</span>
                  </div>
                </div>

                {/* Chat Header */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-border/40">
                  <div className="w-8 h-8 rounded-full bg-brand-olive/20 flex items-center justify-center text-sm">
                    🎒
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-dark leading-tight">Pax</p>
                    <p className="text-[10px] text-brand-olive">
                      {t('home.phonePaxStatus', 'Your unpacking buddy')}
                    </p>
                  </div>
                </div>

                {/* Chat Bubbles */}
                <div className="flex flex-col gap-2.5 px-4 py-4 min-h-[240px]">
                  {/* User bubble */}
                  <div className="self-end max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-brand-dark text-white text-xs leading-relaxed">
                    {t('home.chatUser', "I have three exams, can't sleep, and my group project is falling apart...")}
                  </div>

                  {/* Pax bubble */}
                  <div className="self-start max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-brand-stone text-brand-dark text-xs leading-relaxed">
                    {t(
                      'home.chatPax1',
                      "I hear you 💛 Let's sort this out. Which one feels heaviest right now?"
                    )}
                  </div>

                  {/* Pax follow-up */}
                  <div className="self-start max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-brand-stone text-brand-dark text-xs leading-relaxed">
                    <p className="font-semibold text-brand-accent mb-1 text-[11px]">
                      {t('home.chatMicro', '⚡ Micro-step:')}
                    </p>
                    {t('home.chatPax2', 'Open your notes app and write just the essay title. 2 minutes.')}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-t border-brand-border/40">
                  <div className="flex-1 h-8 rounded-full bg-brand-stone/60 px-3 flex items-center text-[10px] text-brand-muted">
                    {t('home.chatPlaceholder', 'Type what\'s on your mind...')}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-brand-dark flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[14px]">arrow_upward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2 · EDITORIAL NARRATIVE ─── */}
      <section className="bg-white" id="how-it-works">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-20 md:py-28">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <p className="text-xs tracking-[0.2em] uppercase text-brand-muted font-semibold mb-3">
              {t('home.narrativeTag', 'How It Works')}
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-brand-dark tracking-tight leading-tight">
              {t('home.narrativeTitle1', 'Three chapters to a')}{' '}
              <em className="font-serif italic font-medium text-brand-accent">
                {t('home.narrativeTitle2', 'lighter mind.')}
              </em>
            </h2>
          </div>

          {/* Chapter 1 — Mind Dump */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20 md:mb-28">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border text-brand-muted text-xs tracking-wider uppercase font-semibold mb-4">
                <span>01</span>
                <span className="w-1 h-1 rounded-full bg-brand-muted/40" />
                <span>{t('home.ch1Label', 'The Mind Dump')}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 leading-snug">
                {t('home.ch1Title', 'Write everything.')}{' '}
                <span className="text-brand-muted font-normal">
                  {t('home.ch1TitleSub', 'No filter, no format.')}
                </span>
              </h3>
              <p className="text-brand-muted leading-relaxed mb-6 text-[15px]">
                {t(
                  'home.ch1Desc',
                  "Pour every anxious thought, half-formed deadline, and late-night worry into one place. Bullet points, run-on sentences, voice notes — Pax doesn't judge. The act of externalising is itself the first relief."
                )}
              </p>
              <div className="flex items-center gap-2 text-brand-olive text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                {t('home.ch1Cta', 'Free-form text, no templates needed')}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-brand-stone/50 border border-brand-border/60 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-brand-accent/60" />
                  <span className="w-3 h-3 rounded-full bg-brand-olive/40" />
                  <span className="w-3 h-3 rounded-full bg-brand-muted/20" />
                </div>
                <div className="space-y-2 text-sm text-brand-dark/80 font-mono">
                  <p>😰 {t('home.ch1Demo1', 'chem exam friday havent started')}</p>
                  <p>😤 {t('home.ch1Demo2', 'group project nobody responding')}</p>
                  <p>😴 {t('home.ch1Demo3', 'slept 4 hours again')}</p>
                  <p className="text-brand-muted/50">|</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 2 — Micro Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20 md:mb-28">
            <div className="flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-brand-stone/50 border border-brand-border/60 p-6 shadow-sm">
                <div className="space-y-3">
                  {[
                    { icon: '⚡', text: t('home.ch2Step1', 'Open notes → write essay title'), time: '2 min', color: 'bg-brand-accent/15 text-brand-accent' },
                    { icon: '📱', text: t('home.ch2Step2', 'Text groupmate about Part B'), time: '1 min', color: 'bg-brand-purple/10 text-brand-purple' },
                    { icon: '🌙', text: t('home.ch2Step3', 'Set bedtime alarm for 11 PM'), time: '30 sec', color: 'bg-brand-olive/15 text-brand-olive' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-brand-border/40">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${step.color}`}>
                        {step.icon}
                      </span>
                      <span className="flex-1 text-sm text-brand-dark">{step.text}</span>
                      <span className="text-[11px] text-brand-muted">{step.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border text-brand-muted text-xs tracking-wider uppercase font-semibold mb-4">
                <span>02</span>
                <span className="w-1 h-1 rounded-full bg-brand-muted/40" />
                <span>{t('home.ch2Label', 'Start Here — Micro-Steps')}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 leading-snug">
                {t('home.ch2Title', 'One tiny action.')}{' '}
                <span className="text-brand-muted font-normal">
                  {t('home.ch2TitleSub', 'That\'s all it takes.')}
                </span>
              </h3>
              <p className="text-brand-muted leading-relaxed mb-6 text-[15px]">
                {t(
                  'home.ch2Desc',
                  'UNPACK\'s AI distills your overwhelm into concrete, 2-minute micro-steps. Not the entire essay — just the title. Not the full conversation — just one text. Small enough to start right now.'
                )}
              </p>
              <div className="flex items-center gap-2 text-brand-purple text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                {t('home.ch2Cta', 'AI-powered, student-tuned suggestions')}
              </div>
            </div>
          </div>

          {/* Chapter 3 — Unwind */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-border text-brand-muted text-xs tracking-wider uppercase font-semibold mb-4">
                <span>03</span>
                <span className="w-1 h-1 rounded-full bg-brand-muted/40" />
                <span>{t('home.ch3Label', 'Unwind Sanctuary')}</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4 leading-snug">
                {t('home.ch3Title', 'Breathe, release,')}{' '}
                <span className="text-brand-muted font-normal">
                  {t('home.ch3TitleSub', 'feel the lightness.')}
                </span>
              </h3>
              <p className="text-brand-muted leading-relaxed mb-6 text-[15px]">
                {t(
                  'home.ch3Desc',
                  'After taking action, reward yourself with guided breathing exercises, ambient soundscapes, and gentle affirmations. Your mind earned this quiet moment.'
                )}
              </p>
              <div className="flex items-center gap-2 text-brand-olive text-sm font-semibold">
                <span className="material-symbols-outlined text-[18px]">spa</span>
                {t('home.ch3Cta', 'Breathing guides, rain sounds & more')}
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="w-full max-w-sm rounded-2xl bg-gradient-to-br from-brand-olive/10 to-brand-stone/40 border border-brand-border/40 p-8 shadow-sm flex flex-col items-center gap-4">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-brand-olive/15 animate-[breatheExpand_4s_ease-in-out_infinite]" />
                  <div className="absolute inset-2 rounded-full bg-brand-olive/25 animate-[breatheExpand_4s_ease-in-out_infinite_0.5s]" />
                  <div className="absolute inset-4 rounded-full bg-brand-olive/40 flex items-center justify-center text-2xl animate-[breatheExpand_4s_ease-in-out_infinite_1s]">
                    🌿
                  </div>
                </div>
                <p className="text-sm text-brand-muted text-center italic font-serif">
                  {t('home.ch3DemoText', '"Breathe in calm, breathe out tension..."')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3 · INTERACTIVE SANDBOX ─── */}
      <section className="bg-brand-cream" id="mind-dump">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24">
          <div className="rounded-2xl border border-brand-border bg-white p-6 sm:p-10 shadow-sm">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <p className="text-xs tracking-[0.2em] uppercase text-brand-muted font-semibold mb-2">
                {t('home.sandboxTag', 'Try It Now')}
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-brand-dark mb-2">
                {t('home.sandboxTitle', 'Drop one heavy thought right here.')}
              </h3>
              <p className="text-sm text-brand-muted">
                {t(
                  'home.sandboxDesc',
                  "Type whatever is sitting in the back of your neck right now. We won't save it."
                )}
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <textarea
                className="w-full p-4 rounded-xl bg-brand-stone/40 border border-brand-border text-brand-dark placeholder:text-brand-muted/50 text-[15px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-accent/30 resize-none transition-all"
                placeholder={t(
                  'home.sandboxPlaceholder',
                  "e.g. My neuroscience lab report is due tomorrow and I still haven't run the script..."
                )}
                rows={3}
                value={sampleInput}
                onChange={(e) => {
                  setSampleInput(e.target.value);
                  setShowFeedback(false);
                }}
              />

              <div className="flex flex-wrap items-center gap-2 my-4">
                <span className="text-xs text-brand-muted mr-1">
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
                          ? 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30'
                          : 'bg-brand-stone/60 text-brand-muted border border-brand-border hover:bg-brand-stone'
                      }`}
                    >
                      {full}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-olive" />
                  <span className="text-[11px] text-brand-muted">
                    {t('home.privateSandbox', '100% private sandbox')}
                  </span>
                </div>
                <button
                  onClick={handleMiniUnpack}
                  className="px-5 py-2.5 rounded-full bg-brand-dark text-white text-sm font-semibold shadow-[0_3px_0_#0f0c0a] hover:translate-y-[1px] hover:shadow-[0_2px_0_#0f0c0a] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{t('home.btnUnpackThought', 'Unpack Thought')}</span>
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </button>
              </div>

              {showFeedback && (
                <div className="mt-5 p-4 rounded-xl bg-brand-stone/50 border border-brand-border text-brand-dark animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎒</span>
                    <div>
                      <p className="text-sm font-bold text-brand-accent">
                        {t('home.paxFeedbackTitle', 'Pax unpacked this for you:')}
                      </p>
                      <p className="text-sm text-brand-dark/80 mt-1 leading-relaxed">
                        {t(
                          'home.paxFeedbackBody',
                          '"Breathe. Don\'t worry about the entire report right now. Your only 2-minute micro-step: Open the file and write the title heading. That\'s all for now."'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 4 · SOCIAL PROOF ─── */}
      <section className="bg-white">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <span className="text-4xl">💬</span>
            </div>
            <blockquote className="text-[clamp(1.25rem,3vw,1.75rem)] font-serif italic text-brand-dark leading-relaxed mb-6">
              {t(
                'home.testimonial',
                '"I used to spiral at 2 AM before exams. Now I dump everything into UNPACK, pick one micro-step, and actually sleep. It changed my semester."'
              )}
            </blockquote>
            <p className="text-sm text-brand-muted font-semibold">
              {t('home.testimonialAuthor', '— Rina, 3rd year Psychology student')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 mt-12 pt-8 border-t border-brand-border">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-brand-dark">14,200+</p>
                <p className="text-xs text-brand-muted mt-1">
                  {t('home.stat1', 'thoughts unpacked')}
                </p>
              </div>
              <div className="w-px h-10 bg-brand-border hidden md:block" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-brand-dark">88%</p>
                <p className="text-xs text-brand-muted mt-1">
                  {t('home.stat2', 'felt calmer after first session')}
                </p>
              </div>
              <div className="w-px h-10 bg-brand-border hidden md:block" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-brand-dark">2 min</p>
                <p className="text-xs text-brand-muted mt-1">
                  {t('home.stat3', 'average time to first micro-step')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5 · FINAL CTA ─── */}
      <section className="bg-brand-cream">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-20 md:py-28">
          <div className="relative rounded-2xl bg-brand-stone border border-brand-border p-10 sm:p-16 text-center overflow-hidden">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(226,123,88,0.08)_0%,transparent_70%)]" />

            <div className="relative z-10 flex flex-col items-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-dark text-white flex items-center justify-center text-3xl shadow-lg mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
                🎒
              </div>
              <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold text-brand-dark mb-4 leading-tight">
                {t('home.closingTitle', "Ready to put down what you've been carrying?")}
              </h2>
              <p className="text-brand-muted leading-relaxed mb-8 text-[15px]">
                {t(
                  'home.closingDesc',
                  "Take five quiet minutes. Empty the mental backpack and let's see what is actually worth picking back up."
                )}
              </p>
              <Link
                to="/unpack"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-dark text-white font-semibold shadow-[0_4px_0_#0f0c0a] hover:translate-y-[1px] hover:shadow-[0_3px_0_#0f0c0a] active:translate-y-[4px] active:shadow-none transition-all"
              >
                <span>{t('home.ctaStart', 'Start Your First Mind Dump')}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <p className="text-[11px] text-brand-muted/60 mt-6 tracking-wide">
                {t('home.footerTag', 'Always calm · Never algorithmic · Made with care for students')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
