import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from '@/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalId = 'bubble' | 'breathe' | 'rain' | 'float' | 'plant' | 'action' | null;
type SoundKey = 'rain' | 'library' | 'wind' | 'cafe' | 'night';
type BreathPhase = 'inhale' | 'hold' | 'exhale';
type BagStatus = 'pending' | 'in_progress' | 'completed';

interface DBBaggageItem {
  id: string;
  title: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  action_step: string | null;
  status: BagStatus;
  created_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SOUND_FILES: Record<SoundKey, string> = {
  rain: '/rainsound.mp3',
  library: '/sounds/quiet-library.mp3',
  wind: '/sounds/gentle-wind.mp3',
  cafe: '/sounds/late-night-cafe.mp3',
  night: '/room.mp3',
};

const BREATH_ORDER: BreathPhase[] = ['inhale', 'hold', 'exhale'];
const PLACEHOLDER_STEPS = ['Packed directly from My Bag', 'Packed from mind dump'];
const URGENCY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

function getMicroStep(item: DBBaggageItem, t: (key: string, fallback?: string) => string): { text: string; duration: number } {
  const step = item.action_step?.trim();
  if (step && !PLACEHOLDER_STEPS.includes(step)) return { text: step, duration: 10 };
  if (item.category === 'academic') return { text: t('unwind.stepAcademic', 'Open the file and identify the easiest part to start with.'), duration: 10 };
  if (item.category === 'deadline') return { text: t('unwind.stepDeadline', 'Write down the one thing you must remember for this deadline.'), duration: 5 };
  if (item.category === 'social') return { text: t('unwind.stepSocial', 'Send one short message to check in with whoever is involved.'), duration: 5 };
  if (item.category === 'health') return { text: t('unwind.stepHealth', 'Do one small thing for your body: water, stretch, or a short walk.'), duration: 5 };
  if (item.category === 'financial') return { text: t('unwind.stepFinancial', 'Open your banking app and just look at the number. No decisions yet.'), duration: 5 };
  return { text: t('unwind.stepDefault', 'Write down three things you remember about this task.'), duration: 10 };
}

function sortForSmallAction(list: DBBaggageItem[]): DBBaggageItem[] {
  return [...list].sort((a, b) => {
    const u = (URGENCY_RANK[b.urgency] ?? 0) - (URGENCY_RANK[a.urgency] ?? 0);
    if (u !== 0) return u;
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return 0;
  });
}

// ─── Bubble Modal ─────────────────────────────────────────────────────────────
const BUBBLE_COLORS = ['rgba(107,56,212,0.15)', 'rgba(0,108,73,0.12)', 'rgba(130,81,0,0.12)', 'rgba(78,222,163,0.15)', 'rgba(209,188,255,0.25)'];
const MAX_BUBBLES = 12;

interface Bubble { id: number; x: number; y: number; size: number; color: string; drift: number; popping: boolean; }

function BubbleModal() {
  const { t } = useTranslation();
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped] = useState(0);
  const nextId = useRef(0);

  const spawn = useCallback(() => {
    const id = nextId.current++;
    setBubbles((p) => {
      if (p.length >= MAX_BUBBLES) return p;
      return [
        ...p,
        {
          id,
          x: 5 + Math.random() * 90,
          y: 55 + Math.random() * 38,
          size: 38 + Math.random() * 52,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)] ?? 'rgba(107,56,212,0.15)',
          drift: 10 + Math.random() * 8,
          popping: false,
        },
      ];
    });
  }, []);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 6; i++) timeouts.push(setTimeout(spawn, i * 480));
    const iv = setInterval(spawn, 2600);
    return () => {
      clearInterval(iv);
      timeouts.forEach(clearTimeout);
    };
  }, [spawn]);

  const pop = (id: number) => {
    setBubbles((p) => p.map((b) => (b.id === id ? { ...b, popping: true } : b)));
    setTimeout(() => setBubbles((p) => p.filter((b) => b.id !== id)), 340);
    setPopped((n) => n + 1);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <span className="px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-[12px] uppercase tracking-wider">
          {t('unwind.bubbleTag', 'Tactile calm · ~1 min')}
        </span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          {t('unwind.bubbleTitle', 'Pop Bubbles')}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t('unwind.bubbleDesc', 'Pop a few bubbles on screen. Let your mind slow down.')}
        </p>
      </div>

      <div className="w-full h-72 bg-gradient-to-b from-primary-fixed/20 via-surface-container-low to-surface-bright rounded-2xl relative overflow-hidden select-none">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => !b.popping && pop(b.id)}
            className="absolute rounded-full cursor-pointer border border-white/25"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              background: b.color,
              transform: 'translate(-50%, -50%)',
              backdropFilter: 'blur(2px)',
              boxShadow: 'inset 0 -4px 8px rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.04)',
              animation: b.popping
                ? 'bubblePop 0.34s ease-out forwards'
                : `bubbleDrift ${b.drift}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="font-label-md text-label-md text-on-surface-variant">
          Popped: <span className="font-bold text-primary">{popped}</span> / 6
        </div>
        {popped >= 6 && (
          <span className="font-label-md text-secondary font-semibold animate-[fadeIn_0.4s_ease]">
            ✨ {t('unwind.calm', 'Pikiran Tenang 🌿')}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Breathe Modal ────────────────────────────────────────────────────────────
function BreatheModal() {
  const { t } = useTranslation();
  const phaseLabel: Record<BreathPhase, string> = {
    inhale: t('unwind.inhale', 'Inhale...'),
    hold: t('unwind.hold', 'Hold...'),
    exhale: t('unwind.exhale', 'Exhale...'),
  };

  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [count, setCount] = useState(4);
  const [dur, setDur] = useState(1);
  const [remaining, setRem] = useState(60);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);

  const phaseRef = useRef<BreathPhase>('inhale');
  const countRef = useRef(4);
  const totalRef = useRef(60);

  const circleStyle = {
    transform: phase === 'exhale' ? 'scale(0.78)' : 'scale(1.28)',
    transition: 'transform 4s ease-in-out',
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      totalRef.current -= 1;
      setRem(totalRef.current);

      if (totalRef.current <= 0) {
        clearInterval(id);
        setRunning(false);
        setDone(true);
        return;
      }

      countRef.current -= 1;
      setCount(countRef.current);

      if (countRef.current <= 0) {
        const next = BREATH_ORDER[(BREATH_ORDER.indexOf(phaseRef.current) + 1) % 3] as BreathPhase;
        phaseRef.current = next;
        setPhase(next);
        countRef.current = 4;
        setCount(4);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = (min: number) => {
    setDur(min);
    totalRef.current = min * 60;
    setRem(min * 60);
    phaseRef.current = 'inhale';
    setPhase('inhale');
    countRef.current = 4;
    setCount(4);
    setRunning(true);
    setDone(false);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div>
      <div className="text-center mb-6">
        <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] font-label-sm text-[12px] uppercase tracking-wider">
          4-4-4 rhythm
        </span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          {t('unwind.breathingTitle', 'Latihan Napas Pax')}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {t('unwind.subtitle', 'Ambil napas sejenak, rileks, dan tenangkan pikiranmu')}
        </p>
      </div>

      <div className="w-full h-64 flex flex-col items-center justify-center">
        <div
          className="w-44 h-44 rounded-full bg-gradient-to-tr from-primary-fixed to-[#bae6fd] flex flex-col items-center justify-center shadow-lg text-center"
          style={circleStyle}
        >
          {done ? (
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Done ✓</span>
          ) : (
            <>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
                {phaseLabel[phase]}
              </span>
              <span className="font-label-sm text-[13px] text-on-surface-variant mt-0.5">
                {running ? `${count}s` : 'Paused'}
              </span>
            </>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 italic">
          {done ? '"A little slower. A little lighter."' : `${fmt(remaining)} remaining`}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full">
          {[1, 2, 5].map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => reset(min)}
              className={`px-3.5 py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${
                dur === min ? 'bg-primary text-on-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {min} min
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => (done ? reset(dur) : setRunning((r) => !r))}
          className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] active:translate-y-[3px] transition-all cursor-pointer"
        >
          {done ? 'Again' : running ? t('unwind.pauseBreathing', 'Jeda') : 'Resume'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Unwind() {
  const { t } = useTranslation();
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const [activeSound, setActiveSound] = useState<SoundKey>('rain');
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(65);
  const [muted, setMuted] = useState(false);
  const [soundError, setSoundError] = useState<string | null>(null);

  const [items, setItems] = useState<DBBaggageItem[]>([]);
  const [itemIndex, setItemIndex] = useState(0);
  const [loadingItems, setLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const audioRefs = useRef<Record<SoundKey, HTMLAudioElement | null>>({
    rain: null,
    library: null,
    wind: null,
    cafe: null,
    night: null,
  });

  const bagItem = items[itemIndex] ?? null;

  const loadItems = useCallback(async () => {
    setLoading(true);
    setItemsError(null);
    try {
      const { data, error } = await supabase
        .from('baggage_items')
        .select('id,title,category,urgency,action_step,status,created_at')
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(sortForSmallAction((data ?? []) as DBBaggageItem[]));
      setItemIndex(0);
    } catch (err: any) {
      console.error('Failed to load bag items:', err);
      setItemsError(err?.message || 'Could not load your bag.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  useEffect(() => {
    setItemIndex((i) => (items.length === 0 ? 0 : Math.min(i, items.length - 1)));
  }, [items.length]);

  const updateStatus = useCallback(async (id: string, status: BagStatus): Promise<boolean> => {
    const { error } = await supabase.from('baggage_items').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update baggage item status:', error);
      return false;
    }
    setItems((prev) =>
      status === 'completed'
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
    return true;
  }, []);

  const toggleMaster = () => {
    const el = audioRefs.current[activeSound];
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }

    el.play()
      .then(() => {
        setPlaying(true);
        setSoundError(null);
      })
      .catch(() => setPlaying(false));
  };

  const switchTrack = (key: SoundKey) => {
    if (key === activeSound) {
      toggleMaster();
      return;
    }
    audioRefs.current[activeSound]?.pause();
    setActiveSound(key);
    const el = audioRefs.current[key];
    if (el) {
      el.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const ms = bagItem ? getMicroStep(bagItem, t) : null;

  const soundsList: { key: SoundKey; emoji: string; titleKey: string; fallbackTitle: string; descKey: string; fallbackDesc: string }[] = [
    { key: 'rain', emoji: '🌧️', titleKey: 'unwind.soundRainTitle', fallbackTitle: 'Campus Rain 🌧️', descKey: 'unwind.soundRainDesc', fallbackDesc: 'Soft rain outside a quiet campus window.' },
    { key: 'library', emoji: '📚', titleKey: 'unwind.soundLibraryTitle', fallbackTitle: 'Quiet Library 📚', descKey: 'unwind.soundLibraryDesc', fallbackDesc: 'Low ambient pages turning & distant footsteps.' },
    { key: 'wind', emoji: '🌿', titleKey: 'unwind.soundWindTitle', fallbackTitle: 'Gentle Wind 🌿', descKey: 'unwind.soundWindDesc', fallbackDesc: 'Soft rustling leaves across the campus quad.' },
    { key: 'cafe', emoji: '☕', titleKey: 'unwind.soundCafeTitle', fallbackTitle: 'Late Night Café ☕', descKey: 'unwind.soundCafeDesc', fallbackDesc: 'Distant espresso steam & cozy murmurs.' },
    { key: 'night', emoji: '🌙', titleKey: 'unwind.soundNightTitle', fallbackTitle: 'Night Room 🌙', descKey: 'unwind.soundNightDesc', fallbackDesc: 'Warm room fan & subtle nighttime silence.' },
  ];

  const resetCards = [
    {
      id: 'bubble' as const,
      icon: 'bubble_chart',
      iconBg: 'bg-primary-fixed text-primary',
      tagBg: 'bg-primary-fixed/60 text-on-primary-fixed-variant',
      tagKey: 'unwind.bubbleTag',
      fallbackTag: 'Tactile calm · ~1 min',
      titleKey: 'unwind.bubbleTitle',
      fallbackTitle: 'Pop Bubbles',
      descKey: 'unwind.bubbleDesc',
      fallbackDesc: 'Pop a few. Let your mind slow down.',
      ctaKey: 'unwind.bubbleCta',
      fallbackCta: 'Start popping',
      ctaColor: 'text-primary',
    },
    {
      id: 'breathe' as const,
      icon: 'air',
      iconBg: 'bg-[#e0f2fe] text-[#0284c7]',
      tagBg: 'bg-[#e0f2fe] text-[#0369a1]',
      tagKey: 'unwind.breatheTag',
      fallbackTag: '4-4-4 rhythm · 1-5 min',
      titleKey: 'unwind.breathingTitle',
      fallbackTitle: 'Breathe',
      descKey: 'unwind.subtitle',
      fallbackDesc: 'A 60-second gentle breathing reset.',
      ctaKey: 'unwind.breatheCta',
      fallbackCta: 'Sync breath',
      ctaColor: 'text-[#0284c7]',
    },
    {
      id: 'rain' as const,
      icon: 'water_drop',
      iconBg: 'bg-secondary-fixed text-secondary',
      tagBg: 'bg-secondary-container/70 text-on-secondary-container',
      tagKey: 'unwind.rainTag',
      fallbackTag: 'Focus ease · ~2 min',
      titleKey: 'unwind.rainTitle',
      fallbackTitle: 'Follow the Rain',
      descKey: 'unwind.rainDesc',
      fallbackDesc: 'Follow one drop. Nothing else for a moment.',
      ctaKey: 'unwind.rainCta',
      fallbackCta: 'Watch drop',
      ctaColor: 'text-secondary',
    },
    {
      id: 'float' as const,
      icon: 'paragliding',
      iconBg: 'bg-[#fed7aa] text-[#c2410c]',
      tagBg: 'bg-[#ffedd5] text-[#9a3412]',
      tagKey: 'unwind.floatTag',
      fallbackTag: 'Mental unburden · 2 min',
      titleKey: 'unwind.floatTitle',
      fallbackTitle: 'Let It Float',
      descKey: 'unwind.floatDesc',
      fallbackDesc: 'Put one thought down for now without fixing it.',
      ctaKey: 'unwind.floatCta',
      fallbackCta: 'Release thought',
      ctaColor: 'text-[#c2410c]',
    },
    {
      id: 'plant' as const,
      icon: 'potted_plant',
      iconBg: 'bg-tertiary-fixed text-tertiary',
      tagBg: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
      tagKey: 'unwind.plantTag',
      fallbackTag: 'Nurture · 1 min',
      titleKey: 'unwind.plantTitle',
      fallbackTitle: 'Water the Plant',
      descKey: 'unwind.plantDesc',
      fallbackDesc: 'A tiny act of care. Small care still counts.',
      ctaKey: 'unwind.plantCta',
      fallbackCta: 'Tend sprout',
      ctaColor: 'text-tertiary',
    },
  ];

  const activeTrackObj = soundsList.find((s) => s.key === activeSound);

  return (
    <div className="flex flex-col w-full">
      {soundsList.map(({ key }) => (
        <audio
          key={key}
          ref={(el) => {
            audioRefs.current[key] = el;
          }}
          src={SOUND_FILES[key]}
          preload="metadata"
        />
      ))}

      <div className="relative w-full overflow-x-clip pb-16">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop relative z-10">
          {/* HERO */}
          <section className="pt-8 md:pt-12 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 flex flex-col items-start">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
                  {t('unwind.title', 'Ruang Unwind')}
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl">
                  {t('unwind.subtitle', 'Ambil napas sejenak, rileks, dan tenangkan pikiranmu')}
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 01: RESETS */}
          <section className="py-8" id="quick-resets-section">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">✨ {t('unwind.resetsTitle', 'Jeda Singkat Tenang')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  {t('unwind.resetsDesc', 'Latihan interaktif ringan untuk menenangkan pikiran yang tegang')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {resetCards.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setOpenModal(card.id)}
                  className="group cursor-pointer bg-surface-container-lowest hover:bg-surface-bright p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                      <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full ${card.tagBg} font-label-sm text-[11px] mb-2`}>
                      {t(card.tagKey, card.fallbackTag)}
                    </span>
                    <h3 className="font-headline-sm text-[18px] text-on-surface font-bold">
                      {t(card.titleKey, card.fallbackTitle)}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
                      {t(card.descKey, card.fallbackDesc)}
                    </p>
                  </div>
                  <div className={`mt-6 pt-3 flex items-center justify-between ${card.ctaColor} font-label-sm text-label-sm`}>
                    <span>{t(card.ctaKey, card.fallbackCta)}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* SECTION 02: SOUND */}
          <section className="py-10">
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">🎧 {t('unwind.soundTitle', 'Suara Suasana & Ambient')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {t('unwind.soundDesc', 'Pilih musik latar tenang untuk menemani belajarmu')}
              </p>
            </div>

            <div className="bg-surface-container-low p-4 md:p-5 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Now Playing</div>
                  <div className="font-headline-sm text-[16px] text-on-surface font-bold flex items-center gap-2">
                    {activeTrackObj ? t(activeTrackObj.titleKey, activeTrackObj.fallbackTitle) : activeSound}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={toggleMaster}
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm cursor-pointer"
                >
                  {playing ? t('unwind.pauseBreathing', 'Jeda') : t('unwind.startSession', 'Mulai Sesi')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {soundsList.map(({ key, emoji, titleKey, fallbackTitle, descKey, fallbackDesc }) => {
                const isActive = activeSound === key && playing;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTrack(key)}
                    className={`p-4 rounded-2xl shadow-sm transition-all text-left cursor-pointer ${
                      isActive ? 'bg-surface-bright ring-2 ring-primary' : 'bg-surface-container-lowest hover:bg-surface-bright'
                    }`}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <h3 className="font-headline-sm text-[16px] text-on-surface font-semibold mt-2">
                      {t(titleKey, fallbackTitle)}
                    </h3>
                    <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">{t(descKey, fallbackDesc)}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION 03: SMALL ACTION */}
          <section className="py-10 mb-8" id="small-action-section">
            <div className="bg-surface-container-low/70 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="max-w-3xl">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">🌱 {t('unwind.smallActionTitle', 'Satu Langkah Mikro Kecil')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  {t('unwind.smallActionDesc', 'Pilih satu kartu beban teratas dan luangkan 10 menit untuk melangkah tanpa rasa panik.')}
                </p>
              </div>

              {bagItem && ms && (
                <div className="mt-8 bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{bagItem.title}</h3>
                  <p className="text-body-md text-on-surface-variant mt-2">
                    <strong>{t('unwind.nextTinyMove', 'Next tiny move:')}</strong> {ms.text}
                  </p>
                  <button
                    type="button"
                    onClick={() => updateStatus(bagItem.id, 'completed')}
                    className="mt-4 px-6 py-2.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md cursor-pointer"
                  >
                    {t('unwind.completeAction', 'Tandai Selesai')}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}