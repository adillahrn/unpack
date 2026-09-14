import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

type FilterCategory = 'all' | 'academic' | 'social' | 'personal' | 'deadlines';

const weightLevels: Record<number, string> = {
  1: 'Light 🎒',
  2: 'Medium 🎒🎒',
  3: 'Heavy 🎒🎒🎒',
};

const defaultText =
  "Tomorrow I have a presentation and I haven't finished my slides. My algorithm assignment is also due soon, my group hasn't replied, and I have a meeting tonight. I'm really tired and I don't know where to even begin…";

export default function Unpack() {
  const [text, setText] = useState(defaultText);
  const [weight, setWeight] = useState(3);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [isBreathing, setIsBreathing] = useState(false);
  const [breatheLabel, setBreatheLabel] = useState('Breathe');
  const [unpackState, setUnpackState] = useState<'idle' | 'sorting' | 'done'>('idle');

  const charCount = text.length;

  const handleClear = useCallback(() => {
    setText('');
  }, []);

  const handleBreathe = useCallback(() => {
    if (isBreathing) return;
    setIsBreathing(true);
    setBreatheLabel('Inhale...');
    setTimeout(() => setBreatheLabel('Exhale...'), 3000);
    setTimeout(() => {
      setBreatheLabel('Calm 🌿');
      setIsBreathing(false);
    }, 6000);
  }, [isBreathing]);

  const handleUnpack = useCallback(() => {
    if (unpackState !== 'idle') return;
    setUnpackState('sorting');
    setTimeout(() => {
      setUnpackState('done');
      setTimeout(() => setUnpackState('idle'), 1200);
    }, 800);
  }, [unpackState]);

  const handleFilterClick = useCallback((category: FilterCategory) => {
    setActiveFilter(category);
  }, []);

  const isCardVisible = (cardCategory: string) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'deadlines') return cardCategory === 'academic';
    return activeFilter === cardCategory;
  };

  return (
    <div className="flex flex-col w-full">
      {/* Interactive Ambient Noise & Tactile Workspace Container */}
      <div className="w-full max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">

        {/* Top Step Bar & Overline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
          <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-label-md text-primary font-bold uppercase tracking-wider">Step 01 of 02</span>
            <span className="text-outline text-label-md">•</span>
            <span className="text-label-md text-on-surface-variant">Brain Dump &amp; Sorting</span>
          </div>
          <div className="flex items-center gap-space-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px] text-primary">spa</span>
            <span className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold">Safe Desk Sanctuary</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span className="text-label-sm text-on-surface font-semibold bg-surface-container-low px-space-xs py-0.5 rounded">
              {charCount} chars
            </span>
          </div>
        </div>

        {/* Main Section Header */}
        <div className="relative mb-space-xl">
          <div className="max-w-3xl">
            <h1 className="text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs">
              What's taking up space in your mind right now?
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              Dump it all out. Don't worry about spelling, punctuation, or organizing it. Pax will sift through the noise and help sort the weight.
            </p>
          </div>
          {/* Whimsical Stationery Tape Accent (Desktop decorative) */}
          <div className="hidden lg:block absolute -right-4 -top-3 w-28 h-6 bg-amber-100/70 rotate-3 rounded-sm shadow-sm pointer-events-none mix-blend-multiply opacity-80" />
        </div>

        {/* Bento Upper Desk: Mind Dump Sandbox & Pax Speech Companion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start mb-space-xl">

          {/* Input Sandbox (Journal Sheet Metaphor) */}
          <div className="lg:col-span-8 flex flex-col relative">
            {/* Top Washi Tape Pins */}
            <div className="absolute -top-3 left-12 w-24 h-6 bg-yellow-200/60 -rotate-2 rounded-sm shadow-xs z-10 pointer-events-none mix-blend-multiply" />
            <div className="absolute -top-3 right-16 w-20 h-5 bg-purple-200/70 rotate-1 rounded-sm shadow-xs z-10 pointer-events-none mix-blend-multiply" />

            {/* The Paper Sheet Wrapper */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md relative group transition-all duration-300">
              {/* Journal Lines Simulation Header */}
              <div className="flex items-center justify-between border-b border-surface-variant/40 pb-space-xs mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">edit_note</span>
                  <span className="text-label-md text-on-surface-variant">Looseleaf Thought Sheet</span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-on-surface-variant hover:text-error transition-colors text-label-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">ink_eraser</span> Clear
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:text-on-primary-fixed-variant transition-colors text-label-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">mic</span> Voice Dump
                  </button>
                </div>
              </div>

              {/* Lined Text Area */}
              <div className="relative w-full">
                <textarea
                  className="w-full bg-transparent text-body-lg text-on-surface placeholder:text-outline/70 focus:outline-none resize-y leading-[32px] tracking-normal border-none"
                  placeholder="Dump everything here... exams, late laundry, messy texts, unread emails..."
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 31px, rgba(123, 116, 134, 0.08) 31px, rgba(123, 116, 134, 0.08) 32px)',
                    backgroundAttachment: 'local',
                  }}
                />
              </div>

              {/* Interactive Action Deck at base of pad */}
              <div className="mt-space-md pt-space-sm border-t border-surface-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                {/* Quick Bag Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs sm:gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">backpack</span>
                    <span className="text-label-sm uppercase font-bold text-on-surface-variant">Mental Weight:</span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-24 accent-primary cursor-pointer"
                    />
                    <span className="text-label-md text-tertiary font-bold">{weightLevels[weight]}</span>
                  </div>
                </div>

                {/* Primary Unpack Button */}
                <button
                  type="button"
                  onClick={handleUnpack}
                  className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-full bg-primary text-on-primary text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer group"
                >
                  {unpackState === 'sorting' ? (
                    <>
                      <span>Sorting with Pax...</span>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    </>
                  ) : unpackState === 'done' ? (
                    <>
                      <span>Unpacked! ✨</span>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </>
                  ) : (
                    <>
                      <span>Unpack this baggage</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">auto_awesome</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Pax Companion Sticky Panel (Asymmetric Right) */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            {/* Interactive Pax Card */}
            <div className="bg-surface-container-high rounded-xl p-space-lg shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              {/* Washi tape corner */}
              <div className="absolute -top-2 left-6 w-16 h-5 bg-amber-200/80 rotate-2 rounded-xs shadow-xs pointer-events-none mix-blend-multiply" />

              <div className="flex items-start gap-space-md">
                {/* Pax Mascot Circle Avatar */}
                <div className="relative shrink-0 mt-1">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center shadow-inner relative overflow-hidden ring-4 ring-surface-container-lowest">
                    <span className="material-symbols-outlined text-primary text-[32px] animate-bounce">backpack</span>
                  </div>
                  {/* Online badge */}
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center ring-2 ring-surface-container-high">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                  </span>
                </div>

                {/* Speech Bubble */}
                <div className="flex-1 bg-surface-container-lowest rounded-xl p-space-md shadow-xs relative">
                  {/* Speech triangle */}
                  <div className="absolute -left-2 top-4 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-surface-container-lowest border-b-[6px] border-b-transparent" />
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-label-sm font-bold text-primary uppercase">Pax • Your Companion</span>
                    <span className="text-label-sm text-outline">Just now</span>
                  </div>
                  <p className="text-body-sm text-on-surface leading-snug">
                    "Just get it out. No judgement here — I'll help you untangle this knot and unpack it piece by piece! ✨"
                  </p>
                </div>
              </div>

              {/* Compassionate Micro-Meter */}
              <div className="mt-space-md bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[18px]">self_improvement</span>
                  <span className="text-label-sm text-on-surface-variant font-medium">Breathe in for 4s... hold 4s...</span>
                </div>
                <button
                  type="button"
                  onClick={handleBreathe}
                  className={`text-xs px-2.5 py-1 font-label-sm rounded-full transition-all cursor-pointer ${
                    isBreathing
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-secondary-container text-on-secondary-container hover:brightness-95'
                  }`}
                >
                  {breatheLabel}
                </button>
              </div>
            </div>

            {/* Mini Desk Affirmation Note */}
            <div className="bg-amber-50 rounded-xl p-space-md shadow-xs rotate-[-0.8deg] hover:rotate-0 transition-transform duration-200">
              <div className="flex items-center gap-space-xs mb-1">
                <span className="material-symbols-outlined text-tertiary text-[16px]">push_pin</span>
                <span className="text-label-sm font-bold text-tertiary uppercase">Campus Mind-Rule #1</span>
              </div>
              <p className="text-body-sm text-on-surface italic">
                You don't have to carry the whole semester at 3:00 PM on a Tuesday. Just this single afternoon.
              </p>
            </div>
          </div>
        </div>

        {/* Live Unpacked Baggage Section */}
        <div className="w-full mt-space-xl pt-space-lg border-t border-surface-variant/40">
          {/* Section Banner & Pax Insight */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
            <div>
              <div className="flex items-center gap-space-xs mb-space-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold uppercase tracking-wider">
                  Categorized &amp; Defused
                </span>
                <span className="text-label-sm text-on-surface-variant">• 4 items identified</span>
              </div>
              <h2 className="text-headline-lg text-on-surface tracking-tight">
                Let's see what you're carrying
              </h2>
            </div>

            {/* Floating Tip Note */}
            <div className="bg-surface-container px-space-md py-space-xs rounded-xl shadow-xs flex items-center gap-space-sm max-w-md">
              <span className="material-symbols-outlined text-primary text-[20px] shrink-0">psychology_alt</span>
              <p className="text-body-sm text-on-surface-variant">
                <strong className="text-on-surface">Pax's read:</strong> It's not one giant mountain. It's just 4 distinct, conquerable pebbles:
              </p>
            </div>
          </div>

          {/* Filter Tabs / Emotional Pill Tags */}
          <div className="flex items-center gap-space-xs overflow-x-auto pb-space-sm mb-space-lg">
            {([
              { key: 'all' as const, label: 'All (4)' },
              { key: 'academic' as const, label: '📚 Academic (2)' },
              { key: 'social' as const, label: '👥 Social (1)' },
              { key: 'personal' as const, label: '🪫 Personal / Energy (1)' },
              { key: 'deadlines' as const, label: '📅 Deadlines' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFilterClick(key)}
                className={`px-space-md py-space-xs rounded-full text-label-md whitespace-nowrap cursor-pointer transition-all ${
                  activeFilter === key
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 4 Baggage Cards Grid (Tactile Stationery Aesthetic) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">

            {/* CARD 1: Presentation Slides (High Priority) */}
            {isCardVisible('academic') && (
              <div className="baggage-card group relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                {/* Washi tape at top center */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-red-200/70 rotate-[-1deg] rounded-xs shadow-xs pointer-events-none mix-blend-multiply group-hover:rotate-0 transition-transform" />
                <div>
                  <div className="flex items-center justify-between mb-space-sm pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container text-label-sm font-bold tracking-wide uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
                      High Priority
                    </span>
                    <span className="material-symbols-outlined text-outline text-[20px] group-hover:text-primary transition-colors">slideshow</span>
                  </div>
                  <h3 className="text-headline-sm text-on-surface mb-1">Presentation Slides</h3>
                  <p className="text-label-md text-on-surface-variant mb-space-md flex items-center gap-1">
                    <span>📚 Academic</span>
                    <span>•</span>
                    <span className="text-error font-semibold">Due Tomorrow</span>
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md flex items-center justify-between">
                    <span className="text-body-sm text-on-surface-variant">Estimated effort:</span>
                    <span className="text-label-md text-on-surface font-bold">~25 mins</span>
                  </div>
                </div>
                <div className="bg-amber-50/80 rounded-lg p-space-sm mt-space-sm relative">
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[16px] shrink-0 mt-0.5">lightbulb</span>
                    <p className="text-body-sm text-on-surface leading-tight">
                      <strong className="text-tertiary">Pax note:</strong> "The hardest part is opening the deck. Just make 1 slide today."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 2: Algorithm Assignment (Medium Priority) */}
            {isCardVisible('academic') && (
              <div className="baggage-card group relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-amber-200/70 rotate-[1.5deg] rounded-xs shadow-xs pointer-events-none mix-blend-multiply group-hover:rotate-0 transition-transform" />
                <div>
                  <div className="flex items-center justify-between mb-space-sm pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm font-bold tracking-wide uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      Medium Priority
                    </span>
                    <span className="material-symbols-outlined text-outline text-[20px] group-hover:text-tertiary transition-colors">code_blocks</span>
                  </div>
                  <h3 className="text-headline-sm text-on-surface mb-1">Algorithm Assignment</h3>
                  <p className="text-label-md text-on-surface-variant mb-space-md flex items-center gap-1">
                    <span>📚 Academic</span>
                    <span>•</span>
                    <span className="text-tertiary font-semibold">Due in 3 days</span>
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md flex items-center justify-between">
                    <span className="text-body-sm text-on-surface-variant">Estimated effort:</span>
                    <span className="text-label-md text-on-surface font-bold">~2 hours</span>
                  </div>
                </div>
                <div className="bg-amber-50/80 rounded-lg p-space-sm mt-space-sm relative">
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[16px] shrink-0 mt-0.5">lightbulb</span>
                    <p className="text-body-sm text-on-surface leading-tight">
                      <strong className="text-tertiary">Pax note:</strong> "Can wait until tomorrow morning. Put this back in the bag for tonight."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 3: Group Haven't Replied (Can Wait) */}
            {isCardVisible('social') && (
              <div className="baggage-card group relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-emerald-200/70 rotate-[-1.5deg] rounded-xs shadow-xs pointer-events-none mix-blend-multiply group-hover:rotate-0 transition-transform" />
                <div>
                  <div className="flex items-center justify-between mb-space-sm pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-label-sm font-bold tracking-wide uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      Can Wait
                    </span>
                    <span className="material-symbols-outlined text-outline text-[20px] group-hover:text-secondary transition-colors">chat_bubble</span>
                  </div>
                  <h3 className="text-headline-sm text-on-surface mb-1">Group Haven't Replied</h3>
                  <p className="text-label-md text-on-surface-variant mb-space-md flex items-center gap-1">
                    <span>👥 Social</span>
                    <span>•</span>
                    <span className="text-secondary font-semibold">External Delay</span>
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md flex items-center justify-between">
                    <span className="text-body-sm text-on-surface-variant">Estimated effort:</span>
                    <span className="text-label-md text-on-surface font-bold">Waiting on others</span>
                  </div>
                </div>
                <div className="bg-emerald-50/80 rounded-lg p-space-sm mt-space-sm relative">
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">check_circle</span>
                    <p className="text-body-sm text-on-surface leading-tight">
                      <strong className="text-secondary">Pax note:</strong> "Out of your control right now. Close the tab and let them respond."
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CARD 4: Feeling Exhausted (Take Care First) */}
            {isCardVisible('personal') && (
              <div className="baggage-card group relative bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ring-2 ring-primary-container/20">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-purple-200/80 rotate-1 rounded-xs shadow-xs pointer-events-none mix-blend-multiply group-hover:rotate-0 transition-transform" />
                <div>
                  <div className="flex items-center justify-between mb-space-sm pt-1">
                    <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-bold tracking-wide uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Take Care First
                    </span>
                    <span className="material-symbols-outlined text-outline text-[20px] group-hover:text-primary transition-colors">battery_low</span>
                  </div>
                  <h3 className="text-headline-sm text-on-surface mb-1">Feeling Exhausted</h3>
                  <p className="text-label-md text-on-surface-variant mb-space-md flex items-center gap-1">
                    <span>🪫 Personal</span>
                    <span>•</span>
                    <span className="text-primary font-semibold">Low Battery (12%)</span>
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-space-sm mb-space-md flex items-center justify-between">
                    <span className="text-body-sm text-on-surface-variant">Recommended:</span>
                    <span className="text-label-md text-primary font-bold">15 min rest</span>
                  </div>
                </div>
                <div className="bg-purple-50/80 rounded-lg p-space-sm mt-space-sm relative">
                  <div className="flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">favorite</span>
                    <p className="text-body-sm text-on-surface leading-tight">
                      <strong className="text-primary">Pax note:</strong> "Brain is drained. Grab a glass of water and take a 10 min breather."
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Baggage Load Progress Bar Visual */}
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xs mb-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                <span className="material-symbols-outlined text-[24px]">balance</span>
              </div>
              <div>
                <div className="flex items-center gap-space-xs">
                  <span className="text-headline-sm text-on-surface">Unpack Balance Score</span>
                  <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-label-sm font-bold">Defused by 65%</span>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  By separating actionable steps from waiting and self-care, your burden is already lighter.
                </p>
              </div>
            </div>
            {/* Inline Visual Load Gauge */}
            <div className="flex items-center gap-space-sm w-full md:w-64">
              <div className="flex-1 bg-surface-variant rounded-full h-3 overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: '65%' }} />
              </div>
              <span className="text-label-md font-bold text-secondary">65% Clearer</span>
            </div>
          </div>
        </div>

        {/* Bottom Step 02 Anchor Bar */}
        <div className="bg-surface-container-highest/60 backdrop-blur-md rounded-2xl p-space-lg md:p-space-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-lg border border-outline-variant/30">
          <div className="flex items-center gap-space-md text-center sm:text-left">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-primary text-on-primary items-center justify-center font-bold text-headline-sm shadow-sm">
              2
            </div>
            <div>
              <span className="text-label-sm uppercase tracking-wider text-primary font-bold">Next Phase</span>
              <h3 className="text-headline-md text-on-surface">Ready to tackle the next step?</h3>
              <p className="text-body-sm text-on-surface-variant">
                We'll take just the single top priority card and build a cozy 15-minute start plan.
              </p>
            </div>
          </div>
          <Link
            to="/start-here"
            className="inline-flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary text-on-primary text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Proceed to 'Start Here'</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
