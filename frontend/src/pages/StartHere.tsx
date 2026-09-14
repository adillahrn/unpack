import { useState, useEffect, useCallback } from 'react';

const TOTAL_SECONDS = 600; // 10 minutes
const CIRCUMFERENCE = 2 * Math.PI * 50; // radius = 50

const alternateTasks = [
  'Open your presentation file and write the first 3 bullet points.',
  'Skim just the bold subheadings in Chapter 4 of Bio notes.',
  "Reply with one short sentence to professor's email draft.",
  'Sort your desk receipts into one single envelope.',
];

type SoundKey = 'rain' | 'library' | 'wind' | 'mute';

const sounds: { key: SoundKey; icon: string; label: string; iconColor: string }[] = [
  { key: 'rain', icon: 'rainy', label: 'Campus Rain', iconColor: 'text-secondary' },
  { key: 'library', icon: 'local_cafe', label: 'Quiet Library', iconColor: 'text-on-surface-variant' },
  { key: 'wind', icon: 'air', label: 'Gentle Wind', iconColor: 'text-on-surface-variant' },
  { key: 'mute', icon: 'volume_off', label: 'Mute', iconColor: 'text-on-surface-variant' },
];

export default function StartHere() {
  const [remaining, setRemaining] = useState(TOTAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [taskIdx, setTaskIdx] = useState(0);
  const [activeSound, setActiveSound] = useState<SoundKey>('mute');
  const [showBanner, setShowBanner] = useState(false);

  // Timer tick
  useEffect(() => {
    if (!isRunning || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsCompleted(true);
          setShowBanner(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, remaining]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = (TOTAL_SECONDS - remaining) / TOTAL_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * progress;

  const toggleTimer = useCallback(() => {
    if (isCompleted) return;
    setIsRunning((prev) => !prev);
  }, [isCompleted]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsCompleted(false);
    setRemaining(TOTAL_SECONDS);
  }, []);

  const switchTask = useCallback(() => {
    setTaskIdx((prev) => (prev + 1) % alternateTasks.length);
    setIsRunning(false);
    setIsCompleted(false);
    setRemaining(TOTAL_SECONDS);
  }, []);

  const playPauseIcon = isCompleted
    ? 'check'
    : isRunning
      ? 'pause'
      : 'play_arrow';

  const playPauseText = isCompleted
    ? 'Step finished!'
    : isRunning
      ? 'Pause gentle step'
      : remaining < TOTAL_SECONDS
        ? 'Resume 10-minute step'
        : 'Start 10-minute step';

  return (
    <div className="flex flex-col w-full">
      {/* Main container — overflow-x-clip prevents horizontal scroll from glow blobs
          while allowing washi tape elements to overflow vertically */}
      <div className="relative w-full max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg lg:py-space-xl overflow-x-clip">

        {/* Soft Ambient Glow Decorators */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[620px] h-[340px] bg-primary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-72 right-4 w-72 h-72 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* ─── Header / Gentle Reassurance Area ─── */}
        <header className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-space-sm mb-space-lg md:mb-space-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-secondary-container text-on-secondary-container shadow-sm -rotate-1 hover:rotate-0 transition-transform cursor-default select-none">
            <span className="text-sm">🌱</span>
            <span className="font-label-md text-label-md tracking-wide uppercase font-semibold">Anti-overwhelm mode</span>
          </div>

          <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight font-extrabold">
            You don't need to fix everything.
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Just start here. One small move makes room in your backpack.
          </p>
        </header>

        {/* ─── Main Workspace Bento Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-desktop items-start">

          {/* ═══ Left Column — Primary Action (Col 8) ═══ */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">

            {/* ── Center Stage Task Card ── */}
            <article className="relative bg-surface-container-lowest rounded-xl p-space-md md:p-space-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              {/* Washi Tape Pin */}
              <div className="absolute -top-3 left-12 w-24 h-6 bg-tertiary-fixed/70 rounded-sm shadow-sm -rotate-2 pointer-events-none mix-blend-multiply" />

              {/* Top Meta Row */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs pb-space-sm border-b border-surface-variant/40">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-semibold">
                    📚 Academic
                  </span>
                  <span className="text-on-surface-variant text-label-sm">•</span>
                  <span className="font-label-md text-label-md text-error flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    Presentation Tomorrow
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container text-on-surface font-label-md text-label-md">
                  <span
                    className="material-symbols-outlined text-[16px] text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    timer
                  </span>
                  <span>10 minutes only</span>
                </div>
              </div>

              {/* The Micro-Action Focus */}
              <div className="flex items-start gap-space-md mt-space-md mb-space-sm">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-2xl md:text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    co_present
                  </span>
                </div>
                <div className="space-y-space-xs min-w-0">
                  <h2 className="font-headline-lg text-headline-md md:text-headline-lg text-on-surface font-bold leading-tight">
                    {alternateTasks[taskIdx]}
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 flex-wrap">
                    <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                    <span>Deck:</span>
                    <span className="font-semibold text-on-surface">Sociology_Midterm_Final.key</span>
                    <span>(3 slides)</span>
                  </p>
                </div>
              </div>

              {/* Why This Works Note */}
              <div className="p-space-sm md:p-space-md rounded-lg bg-surface-container-low flex items-start gap-space-sm mb-space-md">
                <span className="material-symbols-outlined text-tertiary text-xl mt-0.5 shrink-0">lightbulb</span>
                <div className="font-body-sm text-body-sm text-on-surface-variant space-y-0.5">
                  <p className="font-semibold text-on-surface">Why this tiny move works:</p>
                  <p>Starting carries 80% of the cognitive friction. You do not have to conquer the whole deck right now—just drop down 3 rough thoughts.</p>
                </div>
              </div>

              {/* ── Circular Focus Timer + Controller Hub ── */}
              <div className="bg-surface-container rounded-xl p-space-md md:p-space-lg flex flex-col sm:flex-row items-center gap-space-lg">
                {/* Circular Timer Display */}
                <div className="relative flex items-center justify-center w-40 h-40 shrink-0">
                  <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      className="text-surface-container-highest"
                      cx="60" cy="60" r="50"
                      fill="none" stroke="currentColor" strokeWidth="8"
                    />
                    <circle
                      className="text-primary-container transition-all duration-500 ease-linear"
                      cx="60" cy="60" r="50"
                      fill="none" stroke="currentColor"
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-headline-lg text-on-surface font-black tracking-tighter tabular-nums">
                      {formatTime(remaining)}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                      Sprint
                    </span>
                  </div>
                </div>

                {/* Action Trigger Buttons */}
                <div className="flex flex-col w-full sm:w-auto items-stretch sm:items-start gap-space-xs flex-grow max-w-sm">
                  <button
                    type="button"
                    onClick={toggleTimer}
                    className="w-full inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {playPauseIcon}
                    </span>
                    <span>{playPauseText}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-space-xs w-full">
                    <button
                      type="button"
                      onClick={resetTimer}
                      className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={switchTask}
                      className="px-space-md py-space-xs rounded-full bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">shuffle</span>
                      <span>Pick another</span>
                    </button>
                  </div>

                  <p className="font-label-sm text-label-sm text-on-surface-variant text-center sm:text-left pt-space-xs">
                    No judgment. Even opening the document counts as a victory today.
                  </p>
                </div>
              </div>
            </article>

            {/* ── Sound & Sensory Atmosphere Panel ── */}
            <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-xl">headphones</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Focus Ambience</h3>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Low-frequency student soundscapes</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-xs">
                {sounds.map(({ key, icon, label, iconColor }) => {
                  const isActive = activeSound === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSound(key)}
                      className={`group flex items-center justify-between px-space-md py-space-sm rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary-container text-on-surface shadow-sm'
                          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined text-lg ${isActive ? 'text-secondary' : iconColor}`}>
                          {icon}
                        </span>
                        <span className="font-label-md text-label-md font-semibold">{label}</span>
                      </div>
                      <span
                        className={`w-2 h-2 rounded-full transition-opacity ${
                          isActive
                            ? 'bg-secondary opacity-100'
                            : 'bg-secondary opacity-0 group-hover:opacity-60'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ═══ Right Column — Pax & Preview (Col 4) ═══ */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">

            {/* ── Pax Encouragement Card ── */}
            <div className="relative bg-tertiary-fixed/40 rounded-xl p-space-md shadow-md overflow-hidden">
              <div className="flex items-start gap-space-sm">
                {/* Pax Avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-surface-container-lowest p-1 shadow-md flex items-center justify-center overflow-hidden ring-2 ring-tertiary-fixed">
                    <img
                      className="w-full h-full object-contain"
                      alt="Pax the cheerful backpack companion"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAysyZBq6e2BBm8dxGmJ5oNRAzEEprHQaRsy5MUk_CsE5vlbAyDsshK4PnDN0F4m0kqLa1vqVcXAlIJt-EbZsE2LUMXT8jP31zFY1MEqPcCT8ZTnYEZgS7uqZlzHnr5xzgqBRvttA_vq-X3SjWHRWliEZXOconZGm2Zp2xrSMFwZXzaaOS1X429xuLnAIjgC88woeTE3-QAocVzMNCOIrqfZF3wzLIFEYDoiFM7Vf2cCyBavZEC2ldT"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-base select-none">✨</span>
                </div>

                {/* Speech Bubble */}
                <div className="relative bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex-1 min-w-0">
                  <div className="absolute top-4 -left-2 w-3 h-3 bg-surface-container-lowest rotate-45" />
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary font-bold mb-1">Pax is with you</p>
                  <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                    "I'll watch the clock for you! Put the phone face down, take a big belly breath, and let's get those 3 bullet points down."
                  </p>
                </div>
              </div>

              {/* Pax status tracker */}
              <div className="mt-space-sm pt-space-xs border-t border-tertiary-fixed/40 flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  Sitting quietly nearby
                </span>
                <span className="font-bold text-tertiary">Zero pressure</span>
              </div>
            </div>

            {/* ── Completion Preview: What Happens Next ── */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
              <div className="flex items-center gap-space-xs">
                <div className="w-7 h-7 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">backpack</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">When you finish this step:</h3>
              </div>

              {/* Reward Checklist */}
              <div className="flex flex-col gap-space-sm">
                {/* Item 1 */}
                <div className="flex items-start gap-space-sm p-space-xs rounded-lg bg-surface-container-low">
                  <div className="w-6 h-6 rounded-md bg-secondary text-on-secondary flex items-center justify-center mt-0.5 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold block">Presentation item zipped shut</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">Stowed in your completed pocket.</span>
                  </div>
                </div>

                {/* Item 2 — Weight Reduction */}
                <div className="flex items-start gap-space-sm p-space-xs rounded-lg bg-surface-container-low">
                  <div className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center mt-0.5 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[16px]">scale</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-xs">
                      <span className="font-label-lg text-label-lg text-on-surface font-semibold">Weight drops by 25%</span>
                      <span className="font-label-sm text-label-sm font-bold text-primary whitespace-nowrap">-2.4 kg</span>
                    </div>
                    <div className="w-full bg-surface-variant h-2 rounded-full mt-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>

                {/* Item 3 — Victory Reward */}
                <div className="flex items-start gap-space-sm p-space-xs rounded-lg bg-surface-container-low">
                  <div className="w-6 h-6 rounded-md bg-tertiary text-on-tertiary flex items-center justify-center mt-0.5 shadow-sm shrink-0">
                    <span className="material-symbols-outlined text-[16px]">celebration</span>
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold block">Pax victory confetti</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block">A customized dance unlocked for your journal.</span>
                  </div>
                </div>
              </div>

              {/* Emotional Anchor */}
              <div className="p-space-sm rounded-lg bg-surface-container-high text-center">
                <p className="font-body-sm text-body-sm text-on-surface font-medium italic leading-relaxed">
                  "Action precedes motivation. 10 minutes gives your mind permission to breathe."
                </p>
              </div>
            </div>

            {/* ── Quick Desk Stash Preview ── */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="material-symbols-outlined text-on-surface-variant shrink-0">format_list_bulleted</span>
                <div className="min-w-0">
                  <span className="font-label-md text-label-md text-on-surface font-semibold block">3 other items waiting</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block">Tucked away until you're ready</span>
                </div>
              </div>
              <button
                type="button"
                className="px-space-sm py-1 rounded-full bg-surface-container-lowest text-on-surface font-label-sm text-label-sm shadow-sm hover:bg-surface-variant transition-colors cursor-pointer shrink-0"
              >
                Peek
              </button>
            </div>
          </div>
        </div>

        {/* ─── Completion Celebration Banner ─── */}
        {showBanner && (
          <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-secondary-container text-on-secondary-container p-space-md rounded-2xl shadow-2xl z-50 animate-[slideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="text-3xl shrink-0">🎉</span>
                <div className="min-w-0">
                  <h4 className="font-headline-sm text-headline-sm font-bold">You did the hardest part!</h4>
                  <p className="font-body-sm text-body-sm">Those 3 bullet points exist now. The blank page is defeated.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                className="px-space-md py-space-xs rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-sm cursor-pointer shrink-0"
              >
                Rest now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
