import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useTranslation } from '@/i18n';
import CelebrationModal from '@/components/CelebrationModal';

// ─── Types ────────────────────────────────────────────────────────────────────
type ModalId = 'bubble' | 'breathe' | 'rain' | 'float' | 'plant' | 'action' | null;
type SoundKey = 'rain' | 'library' | 'wind' | 'cafe' | 'night';
type BreathPhase = 'inhale' | 'hold' | 'exhale';
type PlantStage = 0 | 1 | 2 | 3;
type BagStatus = 'pending' | 'in_progress' | 'completed';

interface DBBaggageItem {
  id: string;
  title: string;
  category: string;
  urgency: 'high' | 'medium' | 'low';
  action_step: string | null;
  duration_minutes?: number | null;
  status: BagStatus;
  created_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PAX_IMG = '/pax_holdingtea.png';

/** Semua suara mulai dari detik ke-10, dan looping kembali ke detik ke-10. */
const SOUND_START_SECONDS = 10;

const SOUNDS: { key: SoundKey; emoji: string; title: string; desc: string }[] = [
  { key: 'rain',    emoji: '\u{1F327}\u{FE0F}', title: 'Campus Rain',     desc: 'Soft rain outside a quiet campus window.' },
  { key: 'library', emoji: '\u{1F4DA}',         title: 'Quiet Library',   desc: 'Low ambient pages turning & distant footsteps.' },
  { key: 'wind',    emoji: '\u{1F33F}',         title: 'Gentle Wind',     desc: 'Soft rustling leaves across the campus quad.' },
  { key: 'cafe',    emoji: '\u{2615}',          title: 'Late Night Café', desc: 'Distant espresso steam & cozy murmurs.' },
  { key: 'night',   emoji: '\u{1F319}',         title: 'Night Room',      desc: 'Warm room fan & subtle nighttime silence.' },
];

// File ada di folder /public
const SOUND_FILES: Record<SoundKey, string> = {
  rain: '/rainy-day-in-the-forest.mp3',
  library: '/sounds/quiet-library.mp3',
  wind: '/wind-in-the-trees.mp3',
  cafe: '/sounds/late-night-cafe.mp3',
  night: '/room-ambience-quiet-room.mp3',
};

const SOUND_LABELS: Record<SoundKey, string> = {
  rain: 'Campus Rain \u{1F327}\u{FE0F}',
  library: 'Quiet Library \u{1F4DA}',
  wind: 'Gentle Wind \u{1F33F}',
  cafe: 'Late Night Café \u{2615}',
  night: 'Night Room \u{1F319}',
};

const BREATH_ORDER: BreathPhase[] = ['inhale', 'hold', 'exhale'];

const RESET_CARDS = [
  { id: 'bubble'  as const, icon: 'bubble_chart', iconBg: 'bg-primary-fixed text-primary',      tagBg: 'bg-primary-fixed/60 text-on-primary-fixed-variant',      tag: 'Tactile calm · ~1 min',   title: 'Pop Bubbles',     desc: 'Pop a few. Let your mind slow down.',              cta: 'Start popping',   ctaColor: 'text-primary' },
  { id: 'breathe' as const, icon: 'air',          iconBg: 'bg-[#e0f2fe] text-[#0284c7]',        tagBg: 'bg-[#e0f2fe] text-[#0369a1]',                            tag: '4-4-4 rhythm · 1-5 min',  title: 'Breathe',         desc: 'A 60-second gentle breathing reset.',              cta: 'Sync breath',     ctaColor: 'text-[#0284c7]' },
  { id: 'rain'    as const, icon: 'water_drop',   iconBg: 'bg-secondary-fixed text-secondary',  tagBg: 'bg-secondary-container/70 text-on-secondary-container',  tag: 'Focus ease · ~2 min',     title: 'Follow the Rain', desc: 'Follow one drop. Nothing else for a moment.',      cta: 'Watch drop',      ctaColor: 'text-secondary' },
  { id: 'float'   as const, icon: 'paragliding',  iconBg: 'bg-[#fed7aa] text-[#c2410c]',        tagBg: 'bg-[#ffedd5] text-[#9a3412]',                            tag: 'Mental unburden · 2 min', title: 'Let It Float',    desc: 'Put one thought down for now without fixing it.',  cta: 'Release thought', ctaColor: 'text-[#c2410c]' },
  { id: 'plant'   as const, icon: 'potted_plant', iconBg: 'bg-tertiary-fixed text-tertiary',    tagBg: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',            tag: 'Nurture · 1 min',         title: 'Water the Plant', desc: 'A tiny act of care. Small care still counts.',     cta: 'Tend sprout',     ctaColor: 'text-tertiary' },
];

// ─── Baggage helpers ──────────────────────────────────────────────────────────
// Teks bawaan yang disimpan My Bag untuk item manual. Bukan langkah sungguhan.
const PLACEHOLDER_STEPS = ['Packed directly from My Bag', 'Packed from mind dump'];

const URGENCY_RANK: Record<string, number> = { high: 3, medium: 2, low: 1 };

const CATEGORY_EMOJI: Record<string, string> = {
  academic: '📚',
  deadline: '📅',
  social: '👥',
  personal: '🪫',
  health: '💚',
  financial: '💰',
  other: '📌',
};

function getMicroStep(item: DBBaggageItem): { text: string; duration: number } {
  const itemDuration = item.duration_minutes && item.duration_minutes > 0 ? item.duration_minutes : 10;
  const step = item.action_step?.trim();
  if (step && !PLACEHOLDER_STEPS.includes(step)) return { text: step, duration: itemDuration };
  if (item.category === 'academic')  return { text: 'Open the file and identify the easiest part to start with.', duration: itemDuration };
  if (item.category === 'deadline')  return { text: 'Write down the one thing you must remember for this deadline.', duration: item.duration_minutes && item.duration_minutes > 0 ? item.duration_minutes : 5 };
  if (item.category === 'social')    return { text: 'Send one short message to check in with whoever is involved.', duration: item.duration_minutes && item.duration_minutes > 0 ? item.duration_minutes : 5 };
  if (item.category === 'health')    return { text: 'Do one small thing for your body: water, stretch, or a short walk.', duration: item.duration_minutes && item.duration_minutes > 0 ? item.duration_minutes : 5 };
  if (item.category === 'financial') return { text: 'Open your banking app and just look at the number. No decisions yet.', duration: item.duration_minutes && item.duration_minutes > 0 ? item.duration_minutes : 5 };
  return { text: 'Write down three things you remember about this task.', duration: itemDuration };
}

function sortForSmallAction(list: DBBaggageItem[]): DBBaggageItem[] {
  // Sort di JS stabil: urutan created_at (terbaru dulu) dari query tetap terjaga di antara item yang setara.
  return [...list].sort((a, b) => {
    const u = (URGENCY_RANK[b.urgency] ?? 0) - (URGENCY_RANK[a.urgency] ?? 0);
    if (u !== 0) return u;
    if (a.status !== b.status) return a.status === 'pending' ? -1 : 1;
    return 0;
  });
}

// ─── Bubble Modal ─────────────────────────────────────────────────────────────
const BUBBLE_COLORS = [
  'rgba(107,56,212,0.15)', 'rgba(0,108,73,0.12)',
  'rgba(130,81,0,0.12)',   'rgba(78,222,163,0.15)', 'rgba(209,188,255,0.25)',
];
const MAX_BUBBLES = 12;

interface Bubble { id: number; x: number; y: number; size: number; color: string; drift: number; popping: boolean; }

function BubbleModal() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [popped, setPopped]   = useState(0);
  const nextId = useRef(0);

  const spawn = useCallback(() => {
    const id = nextId.current++;
    setBubbles(p => {
      if (p.length >= MAX_BUBBLES) return p;
      return [...p, {
        id,
        x: 5 + Math.random() * 90,
        y: 55 + Math.random() * 38,
        size: 38 + Math.random() * 52,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)] ?? 'rgba(107,56,212,0.15)',
        drift: 10 + Math.random() * 8, // disimpan sekali, supaya animasi tidak loncat saat re-render
        popping: false,
      }];
    });
  }, []);

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < 6; i++) timeouts.push(setTimeout(spawn, i * 480));
    const iv = setInterval(spawn, 2600);
    return () => { clearInterval(iv); timeouts.forEach(clearTimeout); };
  }, [spawn]);

  const pop = (id: number) => {
    const audio = new Audio('/buble-pop.mp3');
    audio.play().catch(() => {}); // Ignore if browser blocks audio

    setBubbles(p => p.map(b => (b.id === id ? { ...b, popping: true } : b)));
    setTimeout(() => setBubbles(p => p.filter(b => b.id !== id)), 340);
    setPopped(n => n + 1);
  };

  return (
    <div>
      <div className="text-center mb-4">
        <span className="px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-[12px] uppercase tracking-wider">Tactile calm</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Pop a few.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Let your mind slow down with each pop.</p>
      </div>

      <div className="w-full h-72 bg-gradient-to-b from-primary-fixed/20 via-surface-container-low to-surface-bright rounded-2xl relative overflow-hidden select-none">
        {bubbles.map(b => (
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
            {'\u{2728}'} A little quieter.
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Breathe Modal ────────────────────────────────────────────────────────────
function BreatheModal() {
  const phaseLabel: Record<BreathPhase, string> = { inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' };

  const [phase, setPhase]     = useState<BreathPhase>('inhale');
  const [count, setCount]     = useState(4);
  const [dur, setDur]         = useState(1);
  const [remaining, setRem]   = useState(60);
  const [running, setRunning] = useState(true);
  const [done, setDone]       = useState(false);

  const phaseRef = useRef<BreathPhase>('inhale');
  const countRef = useRef(4);
  const totalRef = useRef(60);

  // Tahan napas tetap besar; hanya exhale yang mengecil.
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
        <span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] font-label-sm text-[12px] uppercase tracking-wider">4-4-4 rhythm</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Take a breath.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Just for a minute.</p>
      </div>

      <div className="w-full h-64 flex flex-col items-center justify-center">
        <div
          className="w-44 h-44 rounded-full bg-gradient-to-tr from-primary-fixed to-[#bae6fd] flex flex-col items-center justify-center shadow-lg text-center"
          style={circleStyle}
        >
          {done ? (
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">Done {'\u{2713}'}</span>
          ) : (
            <>
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">{phaseLabel[phase]}</span>
              <span className="font-label-sm text-[13px] text-on-surface-variant mt-0.5">{running ? `${count}s` : 'Paused'}</span>
            </>
          )}
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-4 italic">
          {done ? '"A little slower. A little lighter."' : `${fmt(remaining)} remaining`}
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-full">
          {[1, 2, 5].map(min => (
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
          onClick={() => (done ? reset(dur) : setRunning(r => !r))}
          className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] active:translate-y-[3px] transition-all cursor-pointer"
        >
          {done ? 'Again' : running ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  );
}

// ─── Rain Modal ───────────────────────────────────────────────────────────────
const RAIN_DISTANCE = 260; // px
const RAIN_SPEED = 27;     // px per detik, sama di semua refresh rate

function RainModal() {
  const [dropY, setDropY]   = useState(0);
  const [done, setDone]     = useState(false);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let start: number | null = null;
    const animate = (t: number) => {
      if (start === null) start = t;
      const y = ((t - start) / 1000) * RAIN_SPEED;
      if (y >= RAIN_DISTANCE) {
        setDropY(RAIN_DISTANCE);
        setDone(true);
        return;
      }
      setDropY(y);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setCursor({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <div>
      <div className="text-center mb-4">
        <span className="px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container font-label-sm text-[12px] uppercase tracking-wider">Focus ease</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Follow one drop.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Nothing else for a moment.</p>
      </div>

      <div
        ref={containerRef}
        onMouseMove={onMove}
        className="w-full h-72 rounded-2xl bg-gradient-to-b from-[#f0fdf4] via-surface-container to-surface-bright relative overflow-hidden cursor-crosshair"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 w-px bg-primary/10 rounded-full"
            style={{
              left: `${(i / 14) * 100 + 3}%`,
              height: 28 + (i % 3) * 8,
              animation: `rainFall ${1.8 + i * 0.25}s linear infinite`,
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}

        <div
          className="absolute left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-secondary-fixed-dim flex items-center justify-center shadow-[0_0_14px_rgba(78,222,163,0.55)]"
          style={{ top: dropY }}
        >
          <span className="material-symbols-outlined text-secondary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
        </div>

        <div
          className="absolute w-8 h-8 rounded-full border border-secondary/25 pointer-events-none transition-all duration-100"
          style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, transform: 'translate(-50%, -50%)' }}
        />

        {done && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/60 backdrop-blur-sm animate-[fadeIn_0.4s_ease]">
            <p className="font-headline-sm text-headline-sm text-on-surface font-bold text-center px-6">
              You were here for a moment. That's enough.
            </p>
          </div>
        )}
      </div>

      <p className="font-body-sm text-[14px] text-on-surface-variant italic mt-4">
        Move your cursor over the window to generate soft ripples.
      </p>
    </div>
  );
}

// ─── Float Modal ──────────────────────────────────────────────────────────────
function FloatModal() {
  const [thought, setThought]   = useState('');
  const [floating, setFloating] = useState(false);
  const [released, setReleased] = useState(false);

  return (
    <div>
      <div className="text-center mb-4">
        <span className="px-3 py-1 rounded-full bg-[#ffedd5] text-[#9a3412] font-label-sm text-[12px] uppercase tracking-wider">Mental unburden</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Put one thought down.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">You don't have to solve it right now.</p>
      </div>

      <div className="w-full h-64 bg-gradient-to-t from-surface-container to-[#fed7aa]/30 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
        {floating && !released && (
          <div
            className="absolute flex flex-col items-center"
            style={{ animation: 'floatUp 3.5s ease-in forwards', bottom: 24 }}
            onAnimationEnd={() => setReleased(true)}
          >
            {/* Balloon body */}
            <div
              className="relative flex items-center justify-center text-center px-5 py-4 max-w-[220px] min-w-[120px]"
              style={{
                background: 'linear-gradient(135deg, #fb923c 0%, #ea580c 60%, #c2410c 100%)',
                borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
                boxShadow: 'inset -8px -6px 18px rgba(0,0,0,0.12), inset 6px 8px 16px rgba(255,255,255,0.25), 0 8px 24px rgba(234,88,12,0.3)',
              }}
            >
              {/* Shine highlight */}
              <div
                className="absolute top-2.5 left-3 w-6 h-8 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 70%)' }}
              />
              <p className="font-body-sm text-[13px] text-white font-medium leading-snug relative z-10">
                {thought}
              </p>
            </div>
            {/* Knot */}
            <div className="w-0 h-0 -mt-px" style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #c2410c' }} />
            {/* String */}
            <div className="w-px h-10 bg-stone-400/60" style={{ background: 'linear-gradient(to bottom, #c2410c, #a8a29e 40%, transparent)' }} />
          </div>
        )}

        {!floating && !released && (
          <p className="font-body-sm text-body-sm text-on-surface-variant/80 text-center">
            Write one nagging thought below, then release it into the open sky.
          </p>
        )}

        {released && (
          <div className="text-center animate-[fadeIn_0.4s_ease] space-y-2">
            <p className="font-headline-sm text-headline-sm text-on-surface font-bold">You don't have to solve this right now.</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">"Releasing attention for now. You can come back to this later."</p>
          </div>
        )}
      </div>

      {!released && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={thought}
            onChange={e => setThought(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && thought.trim() && setFloating(true)}
            placeholder="What's on your mind? (e.g. I'm worried about presentation)"
            className="flex-1 bg-surface-container-low rounded-full px-4 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            disabled={!thought.trim() || floating}
            onClick={() => setFloating(true)}
            className="px-5 py-2.5 rounded-full bg-[#ea580c] text-white font-label-md text-label-md shadow-[0_3px_0_#9a3412] active:translate-y-[2px] transition-all shrink-0 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            Let it float {'\u{1F388}'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Plant Modal ──────────────────────────────────────────────────────────────
function PlantSVG({ stage }: { stage: PlantStage }) {
  // Heights / sizes per stage for stem, leaves, flower
  const stemH   = [20, 50, 80, 95][stage] ?? 20;
  const leafScale = [0, 0.6, 1, 1][stage] ?? 0;
  const hasFlower = stage >= 3;
  const hasBud    = stage >= 2;

  return (
    <svg viewBox="0 0 160 200" width="160" height="200" className="overflow-visible">
      {/* ── Pot ── */}
      <defs>
        <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c2956a" />
          <stop offset="100%" stopColor="#a0714f" />
        </linearGradient>
        <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c3d2e" />
          <stop offset="100%" stopColor="#3e2723" />
        </linearGradient>
        <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#388e3c" />
        </linearGradient>
      </defs>

      {/* Pot rim */}
      <rect x="38" y="148" width="84" height="10" rx="3" fill="url(#potGrad)" />
      {/* Pot body (trapezoid via polygon) */}
      <polygon points="44,158 116,158 110,198 50,198" fill="url(#potGrad)" />
      {/* Pot highlight */}
      <polygon points="44,158 68,158 64,198 50,198" fill="rgba(255,255,255,0.12)" />
      {/* Soil */}
      <ellipse cx="80" cy="152" rx="38" ry="6" fill="url(#soilGrad)" />

      {/* ── Stem ── grows upward from soil */}
      <rect
        x="77" y={148 - stemH} width="6" height={stemH} rx="3"
        fill="url(#stemGrad)"
        style={{ transition: 'all 0.7s ease-out' }}
      />

      {/* ── Leaves ── appear at stage ≥ 1 */}
      {leafScale > 0 && (
        <g style={{ transition: 'all 0.6s ease-out', transform: `scale(${leafScale})`, transformOrigin: '80px 110px' }}>
          {/* Left leaf */}
          <ellipse cx="60" cy="105" rx="18" ry="8" fill="#66bb6a" transform="rotate(-30 60 105)" />
          <line x1="60" y1="105" x2="77" y2="110" stroke="#388e3c" strokeWidth="1" />
          {/* Right leaf */}
          <ellipse cx="100" cy="100" rx="18" ry="8" fill="#81c784" transform="rotate(25 100 100)" />
          <line x1="100" y1="100" x2="83" y2="108" stroke="#388e3c" strokeWidth="1" />
        </g>
      )}

      {/* ── Extra leaves at stage 2+ ── */}
      {stage >= 2 && (
        <g style={{ transition: 'all 0.6s ease-out 0.15s' }}>
          <ellipse cx="54" cy="82" rx="14" ry="6" fill="#4caf50" transform="rotate(-40 54 82)" />
          <line x1="54" y1="82" x2="77" y2="88" stroke="#2e7d32" strokeWidth="1" />
          <ellipse cx="108" cy="78" rx="14" ry="6" fill="#a5d6a7" transform="rotate(35 108 78)" />
          <line x1="108" y1="78" x2="83" y2="85" stroke="#388e3c" strokeWidth="1" />
        </g>
      )}

      {/* ── Bud at stage 2 ── */}
      {hasBud && !hasFlower && (
        <g style={{ transition: 'all 0.5s ease-out' }}>
          <ellipse cx="80" cy={148 - stemH - 6} rx="7" ry="9" fill="#aed581" />
          <ellipse cx="80" cy={148 - stemH - 8} rx="4" ry="5" fill="#c5e1a5" />
        </g>
      )}

      {/* ── Flower at stage 3 ── */}
      {hasFlower && (
        <g style={{ animation: 'plantGrow 0.6s ease-out' }}>
          {/* Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="80" cy={148 - stemH - 16}
              rx="8" ry="14"
              fill={angle % 120 === 0 ? '#f48fb1' : '#f8bbd0'}
              transform={`rotate(${angle} 80 ${148 - stemH - 16})`}
            />
          ))}
          {/* Center */}
          <circle cx="80" cy={148 - stemH - 16} r="7" fill="#fff176" />
          <circle cx="80" cy={148 - stemH - 16} r="4" fill="#ffee58" />
        </g>
      )}

      {/* ── Water drops animation (shown briefly after watering) ── */}
    </svg>
  );
}

function PlantModal() {
  const [stage, setStage]       = useState<PlantStage>(0);
  const [feedback, setFeedback] = useState('Sprout is resting peacefully.');
  const [waterDrop, setWaterDrop] = useState(false);
  const [sunRay, setSunRay]       = useState(false);

  const care = (type: 'water' | 'sun') => {
    const next = Math.min(stage + 1, 3) as PlantStage;
    setStage(next);

    if (type === 'water') {
      setWaterDrop(true);
      setTimeout(() => setWaterDrop(false), 1200);
    } else {
      setSunRay(true);
      setTimeout(() => setSunRay(false), 1200);
    }

    setFeedback(
      next >= 3
        ? 'Fully bloomed! Small care still counts. \u{2728}'
        : type === 'water'
        ? 'The soil soaked it in gently. \u{1F4A7}'
        : "A warm ray. It's growing. \u{2600}\u{FE0F}"
    );
  };

  return (
    <div>
      <div className="text-center mb-4">
        <span className="px-3 py-1 rounded-full bg-tertiary-fixed/70 text-on-tertiary-fixed font-label-sm text-[12px] uppercase tracking-wider">Nurture</span>
        <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">A tiny act of care.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Small care still counts.</p>
      </div>

      <div className="w-full h-72 bg-gradient-to-b from-[#e8f5e9]/60 via-surface-container-low to-surface-bright rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Sun ray overlay */}
        {sunRay && (
          <div className="absolute inset-0 pointer-events-none animate-[fadeIn_0.3s_ease]" style={{ background: 'radial-gradient(ellipse at 70% 10%, rgba(255,238,88,0.35) 0%, transparent 60%)', animation: 'fadeIn 0.3s ease, fadeOut 0.4s ease 0.8s forwards' }} />
        )}
        {/* Water drops */}
        {waterDrop && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-6 pointer-events-none">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-3 rounded-full bg-[#42a5f5]/70"
                style={{ animation: `rainFall 0.9s ease-in forwards`, animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}

        <PlantSVG stage={stage} />
        <p className="mt-2 font-label-sm text-label-sm text-tertiary font-semibold text-center">{feedback}</p>

        {/* Stage indicator */}
        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2, 3].map(s => (
            <div key={s} className={`w-2 h-2 rounded-full transition-all duration-500 ${s <= stage ? 'bg-tertiary scale-110' : 'bg-surface-variant'}`} />
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => care('water')}
          disabled={stage >= 3}
          className="px-5 py-2.5 rounded-full bg-[#0284c7] text-white font-label-md text-label-md shadow-[0_3px_0_#0369a1] active:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">water_drop</span>
          <span>Water Plant</span>
        </button>
        <button
          type="button"
          onClick={() => care('sun')}
          disabled={stage >= 3}
          className="px-5 py-2.5 rounded-full bg-[#eab308] text-on-surface font-label-md text-label-md shadow-[0_3px_0_#ca8a04] active:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
          <span>Give Sunlight</span>
        </button>
      </div>
    </div>
  );
}

// ─── Action Modal ─────────────────────────────────────────────────────────────
interface ActionModalProps {
  item: DBBaggageItem;
  onStatusChange: (id: string, status: BagStatus) => Promise<boolean>;
  onClose: () => void;
}

function ActionModal({ item, onStatusChange, onClose }: ActionModalProps) {
  const { t } = useTranslation();
  const ms    = getMicroStep(item);
  const TOTAL = ms.duration * 60;

  const [rem, setRem]                 = useState(TOTAL);
  const [running, setRunning]         = useState(false); // Tidak langsung start otomatis
  const [hasStarted, setHasStarted]   = useState(false);
  const [done, setDone]               = useState(false);
  const [saving, setSaving]           = useState(false);
  const finishedRef                   = useRef(false);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const wLabel = item.urgency === 'high' ? 'Heavy' : item.urgency === 'medium' ? 'Moderate' : 'Light';

  // Sesuaikan durasi secara manual (-1 menit atau +1 menit), batas 1 s.d. 60 menit
  const adjustDuration = (deltaSeconds: number) => {
    setRem((prev) => {
      const next = prev + deltaSeconds;
      return Math.max(60, Math.min(3600, next));
    });
  };

  const handleStart = () => {
    setHasStarted(true);
    setRunning(true);
  };

  // Dipanggil sekali saja: timer habis atau "Finish Early".
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setRunning(false);
    setDone(true);
    if (item.status === 'pending') void onStatusChange(item.id, 'in_progress');
  }, [item.id, item.status, onStatusChange]);

  // Effect 1: hanya mengurangi detik (tanpa side effect di dalam updater).
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRem(p => Math.max(p - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  // Effect 2: bereaksi ketika waktu habis.
  useEffect(() => {
    if (rem === 0) finish();
  }, [rem, finish]);

  const markDone = async () => {
    setSaving(true);
    const ok = await onStatusChange(item.id, 'completed');
    setSaving(false);
    if (ok) onClose();
  };

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-4 animate-[fadeIn_0.4s_ease]">
        <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">check</span>
        </div>
        <h3 className="font-headline-lg text-headline-lg text-on-surface">That's enough for now. {'\u{2713}'}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-sm">
          You gave "{item.title}" a few quiet minutes. It's saved as in progress in My Bag.
        </p>

        <div className="mt-6 bg-surface-container-low rounded-xl p-4 w-full max-w-xs flex flex-col items-center gap-2">
          <span className="text-2xl">{'\u{1F392}'}</span>
          <p className="font-label-lg text-label-lg text-on-surface font-bold">Mental Weight</p>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant">Before</p>
              <p className="font-headline-sm text-headline-sm text-error font-bold">{wLabel}</p>
            </div>
            <span className="material-symbols-outlined text-secondary">arrow_forward</span>
            <div className="text-center">
              <p className="font-label-sm text-label-sm text-on-surface-variant">After</p>
              <p className="font-headline-sm text-headline-sm text-secondary font-bold">Lighter</p>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant italic text-center">(A playful metaphor, not a measurement.)</p>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={markDone}
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Mark as done'}
          </button>
          <Link
            to="/my-bag"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-variant transition-colors"
          >
            Back to My Bag
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md cursor-pointer hover:bg-surface-variant transition-colors"
          >
            Unwind longer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[12px] uppercase tracking-wider font-bold">
        {Math.ceil(rem / 60)}-Minute Protected Sprint
      </span>
      <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">One thing. That's all.</h3>
      <p className="font-label-md text-label-md text-primary font-bold mt-2 max-w-sm">{item.title}</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">{ms.text}</p>

      {/* Timer Display with Increment / Decrement Controls */}
      <div className="my-6 p-6 rounded-2xl bg-surface-container-low w-full flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
          {/* Decrement by 1 minute */}
          <button
            type="button"
            onClick={() => adjustDuration(-60)}
            disabled={rem <= 60}
            aria-label="Kurangi durasi 1 menit"
            title="-1 menit"
            className="w-10 h-10 rounded-full bg-surface-container-highest hover:bg-surface-variant active:scale-95 text-on-surface flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>

          {/* Countdown Display */}
          <div className="font-display-lg text-[56px] sm:text-[64px] leading-tight text-primary font-extrabold tracking-tight tabular-nums select-none">
            {fmt(rem)}
          </div>

          {/* Increment by 1 minute */}
          <button
            type="button"
            onClick={() => adjustDuration(60)}
            disabled={rem >= 3600}
            aria-label="Tambah durasi 1 menit"
            title="+1 menit"
            className="w-10 h-10 rounded-full bg-surface-container-highest hover:bg-surface-variant active:scale-95 text-on-surface flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 shadow-xs"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>

        <div className="font-label-sm text-label-sm text-on-surface-variant mt-2 flex items-center gap-1.5">
          {!hasStarted ? (
            <span>{t('unwind.readyToStart', 'Ready when you are • Adjust with ±1 min')}</span>
          ) : (
            <span>Focus window {running ? 'running' : 'paused'} • ±1 min</span>
          )}
        </div>
      </div>

      <div className="bg-[#fef9c3]/60 p-4 rounded-xl flex items-center gap-3 text-left w-full mb-6">
        <img alt="Pax" className="w-8 h-8 object-contain shrink-0" src={PAX_IMG} />
        <p className="font-body-sm text-[13.5px] text-on-surface italic">
          "I'll stay right here. You don't need to think about the next thing yet."
        </p>
      </div>

      <div className="flex items-center gap-3">
        {!hasStarted ? (
          <>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md font-bold shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">play_arrow</span>
              <span>{t('unwind.startFocus', 'Start Focus')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRunning(r => !r)}
              className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] active:translate-y-[2px] transition-all cursor-pointer"
            >
              {running ? t('unwind.pauseBreathing', 'Pause') : t('unwind.resume', 'Resume')}
            </button>
            <button
              type="button"
              onClick={finish}
              className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
            >
              {t('unwind.finishEarly', 'Finish Early')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Unwind() {
  const { t } = useTranslation();
  const location = useLocation();
  const [openModal, setOpenModal]     = useState<ModalId>(null);
  const [activeSound, setActiveSound] = useState<SoundKey>('rain');
  const [playing, setPlaying]         = useState(false);
  const [volume, setVolume]           = useState(65);
  const [muted, setMuted]             = useState(false);
  const [soundError, setSoundError]   = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const targetId = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (targetId) {
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId) || document.getElementById(`${targetId}-section`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Small Action: daftar item dari My Bag (tabel baggage_items)
  const [items, setItems]             = useState<DBBaggageItem[]>([]);
  const [itemIndex, setItemIndex]     = useState(0);
  const [loadingItems, setLoading]    = useState(true);
  const [itemsError, setItemsError]   = useState<string | null>(null);
  const [actionItem, setActionItem]   = useState<DBBaggageItem | null>(null);

  const audioRefs = useRef<Record<SoundKey, HTMLAudioElement | null>>({
    rain: null, library: null, wind: null, cafe: null, night: null,
  });

  const bagItem = items[itemIndex] ?? null;

  // ─── Load item dari My Bag ───────────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    setLoading(true);
    setItemsError(null);
    try {
      const { data, error } = await supabase
        .from('baggage_items')
        .select('*')
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

  // Jaga indeks tetap valid ketika daftar berubah (mis. item selesai)
  useEffect(() => {
    setItemIndex(i => (items.length === 0 ? 0 : Math.min(i, items.length - 1)));
  }, [items.length]);

  // Update status ke Supabase, lalu sinkronkan state lokal.
  const updateStatus = useCallback(async (id: string, status: BagStatus): Promise<boolean> => {
    const { error } = await supabase.from('baggage_items').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update baggage item status:', error);
      return false;
    }
    setItems(prev =>
      status === 'completed'
        ? prev.filter(i => i.id !== id)
        : prev.map(i => (i.id === id ? { ...i, status } : i))
    );
    if (status === 'completed') setShowCelebration(true);
    return true;
  }, []);

  const pickAnother = () => {
    if (items.length <= 1) return;
    setItemIndex(i => (i + 1) % items.length);
  };

  const startAction = () => {
    if (!bagItem) return;
    setActionItem(bagItem);
    setOpenModal('action');
  };

  const closeModal = useCallback(() => {
    setOpenModal(null);
    setActionItem(null);
  }, []);

  // ─── Audio ───────────────────────────────────────────────────────────────────
  // Volume & mute disinkronkan ke semua elemen audio.
  useEffect(() => {
    Object.values(audioRefs.current).forEach(el => {
      if (el) el.volume = muted ? 0 : volume / 100;
    });
  }, [volume, muted]);

  // Hentikan semua suara ketika meninggalkan halaman.
  useEffect(() => {
    const refs = audioRefs.current;
    return () => {
      Object.values(refs).forEach(el => el?.pause());
    };
  }, []);

  const loopStartFor = (el: HTMLAudioElement) =>
    Number.isFinite(el.duration) && el.duration > SOUND_START_SECONDS + 1 ? SOUND_START_SECONDS : 0;

  // Lompat kembali ke detik ke-10 (dipakai untuk looping).
  const loopBack = (el: HTMLAudioElement) => {
    el.currentTime = loopStartFor(el);
    if (el.paused) el.play().catch(() => {});
  };

  // Pemutaran baru: selalu mulai dari detik ke-10.
  const playFromStart = (key: SoundKey) => {
    const el = audioRefs.current[key];
    if (!el) return;

    el.volume = muted ? 0 : volume / 100;

    const seek = () => { el.currentTime = loopStartFor(el); };
    if (el.readyState >= 1) seek();
    else el.addEventListener('loadedmetadata', seek, { once: true });

    el.play()
      .then(() => { setPlaying(true); setSoundError(null); })
      .catch(() => {
        setPlaying(false);
        setSoundError("Couldn't play this sound. Check that the file exists in /public.");
      });
  };

  const toggleMaster = () => {
    const el = audioRefs.current[activeSound];
    if (!el) return;

    if (playing) {
      el.pause();
      setPlaying(false);
      return;
    }

    // Belum pernah diputar → mulai dari detik ke-10. Sudah pernah → lanjut dari posisi terakhir.
    if (el.currentTime > 0) {
      el.play()
        .then(() => { setPlaying(true); setSoundError(null); })
        .catch(() => setPlaying(false));
    } else {
      playFromStart(activeSound);
    }
  };

  const switchTrack = (key: SoundKey) => {
    if (key === activeSound) {
      toggleMaster();
      return;
    }
    audioRefs.current[activeSound]?.pause();
    setActiveSound(key);
    playFromStart(key);
  };

  const modalContent: Record<Exclude<NonNullable<ModalId>, 'action'>, React.ReactNode> = {
    bubble:  <BubbleModal />,
    breathe: <BreatheModal />,
    rain:    <RainModal />,
    float:   <FloatModal />,
    plant:   <PlantModal />,
  };

  const ms = bagItem ? getMicroStep(bagItem) : null;

  return (
    <div className="flex flex-col w-full">
      {/* Audio players. Tidak pakai atribut `loop`, supaya loop bisa kembali ke detik ke-10. */}
      {SOUNDS.map(({ key }) => (
        <audio
          key={key}
          ref={el => { audioRefs.current[key] = el; }}
          src={SOUND_FILES[key]}
          preload="metadata"
          onTimeUpdate={e => {
            const el = e.currentTarget;
            if (Number.isFinite(el.duration) && el.duration - el.currentTime < 0.3) loopBack(el);
          }}
          onEnded={e => loopBack(e.currentTarget)}
          onError={() => {
            if (key === activeSound) {
              setPlaying(false);
              setSoundError(`Sound file not found: ${SOUND_FILES[key]}`);
            }
          }}
        />
      ))}

      {/* ─── Modal Backdrop ─── */}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-[fadeIn_0.18s_ease]"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-xl bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-[0_14px_32px_-6px_rgba(41,37,36,0.14)] relative animate-[slideUp_0.22s_ease-out] max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-surface-container-low text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {openModal === 'action' && actionItem ? (
              <ActionModal item={actionItem} onStatusChange={updateStatus} onClose={closeModal} />
            ) : (
              openModal !== 'action' && modalContent[openModal]
            )}
          </div>
        </div>
      )}

      <div className="relative w-full overflow-x-clip pb-16">
        {/* Ambient glows */}
        <div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-primary-fixed/40 blur-3xl pointer-events-none" />
        <div className="absolute top-48 -right-24 w-80 h-80 rounded-full bg-secondary-fixed/30 blur-3xl pointer-events-none" />
        <div className="absolute top-[820px] left-1/3 w-72 h-72 rounded-full bg-tertiary-fixed/30 blur-3xl pointer-events-none" />

        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop relative z-10">

          {/* ═══════════════════════════════════════════════════════ HERO ══ */}
          <section className="pt-8 md:pt-12 pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-7 flex flex-col items-start">
                <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">
                  You can pause here or start here.
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl">
                  Nothing needs to be solved right now. Give your nervous system two quiet minutes before carrying anything else.
                </p>
              </div>
            </div>
          </section>

          {/* ═════════════════════════════════ SECTION 01: SMALL ACTION ══ */}
          <section className="py-8" id="small-action-section">
            <div className="mb-8">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">🌱 One Small Pebble</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Before you unwind, take care of just one thing. Pick the top pebble from your bag and give it a gentle, frictionless start.
              </p>
            </div>

            {loadingItems && (
              <div className="flex items-center justify-center py-12 gap-3">
                <span className="material-symbols-outlined text-primary text-[28px] animate-spin">progress_activity</span>
                <span className="text-body-md text-on-surface-variant">Loading your bag…</span>
              </div>
            )}

            {itemsError && (
              <div className="p-space-md rounded-xl bg-error-container text-on-error-container flex items-center gap-space-sm shadow-sm mb-6">
                <span className="material-symbols-outlined text-error text-2xl">error</span>
                <p className="text-body-sm text-on-error-container">{itemsError}</p>
              </div>
            )}

            {!loadingItems && !itemsError && items.length === 0 && (
              <div className="bg-surface-container-lowest rounded-2xl p-8 text-center shadow-[0_2px_8px_-2px_rgba(41,37,36,0.05)]">
                <span className="material-symbols-outlined text-[40px] text-outline/50 mb-3">inventory_2</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                  {t('unwind.emptyBagTitle', 'Your bag is empty')}
                </h3>
                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                  {t('unwind.emptyBagDesc', 'Head to Unpack to dump your thoughts and sort them into pebbles first. Then come back here to start chipping away.')}
                </p>
              </div>
            )}

            {bagItem && ms && (
              <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_2px_8px_-2px_rgba(41,37,36,0.05)] hover:shadow-[0_14px_32px_-6px_rgba(41,37,36,0.12)] transition-shadow duration-300 relative overflow-hidden">
                {/* Pebble Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Pebble info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-label-sm font-bold uppercase tracking-wider">
                        {t('unwind.singlePebbleBadge', "Today's Single Pebble")}
                      </span>
                    </div>

                    <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">
                      {bagItem.title}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
                      {t('unwind.estimatedEffort', 'Estimated effort:')} {ms.duration} {t('unwind.minutes', 'minutes')} • {t('unwind.lowFriction', 'Low friction')}
                    </p>
                  </div>

                  {/* Right: CTA */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={startAction}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary text-label-lg font-bold shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
                    >
                      {t('unwind.beginSoftly', 'Begin Softly')}
                    </button>
                  </div>
                </div>

                {/* Micro step hint */}
                <div className="mt-5 pt-5 border-t border-surface-variant/30">
                  <div className="flex items-start gap-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                    <span className="material-symbols-outlined text-amber-700 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">lightbulb</span>
                    <div>
                      <p className="text-body-sm text-amber-950 dark:text-amber-100 leading-relaxed">
                        <strong className="text-amber-900 dark:text-amber-200 font-bold">{t('unwind.nextTinyMove', 'Next tiny move:')}</strong>{' '}
                        {ms.text}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Item navigation */}
                {items.length > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-label-sm text-on-surface-variant">
                      {CATEGORY_EMOJI[bagItem.category] ?? '📌'} {itemIndex + 1} {t('unwind.of', 'of')} {items.length} {t('unwind.pebblesCount', 'pebbles')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setItemIndex(i => Math.max(0, i - 1))}
                        disabled={itemIndex === 0}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemIndex(i => Math.min(items.length - 1, i + 1))}
                        disabled={itemIndex === items.length - 1}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ═════════════════════════════════════════ SECTION 02: RESETS ══ */}
          <section className="py-8 scroll-mt-6 md:scroll-mt-8" id="quick-resets">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">{'\u{2728}'} Quick Resets</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                  A minute or two. That's all. Gentle interactive tactile micro-tools.
                </p>
              </div>
              <div className="mt-3 md:mt-0 font-label-md text-label-md text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">check_circle</span>
                <span>Tap any card to open quiet room</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {RESET_CARDS.map(card => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setOpenModal(card.id)}
                  className="group cursor-pointer bg-surface-container-lowest hover:bg-surface-bright p-5 rounded-2xl shadow-[0_2px_8px_-2px_rgba(41,37,36,0.05)] hover:shadow-[0_14px_32px_-6px_rgba(41,37,36,0.12)] hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between relative overflow-hidden text-left"
                >
                  <div>
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                    </div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full ${card.tagBg} font-label-sm text-[11px] mb-2`}>{card.tag}</span>
                    <h3 className="font-headline-sm text-[18px] text-on-surface group-hover:text-primary transition-colors">{card.title}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{card.desc}</p>
                  </div>
                  <div className={`mt-6 pt-3 flex items-center justify-between ${card.ctaColor} font-label-sm text-label-sm`}>
                    <span>{card.cta}</span>
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* ══════════════════════════════════════════ SECTION 03: SOUND ══ */}
          <section className="py-10">
            <div className="mb-6">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{'\u{1F3A7}'} Sound</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Let something softer fill the room. Looped serene audio textures.
              </p>
            </div>

            {/* Master control bar */}
            <div className="bg-surface-container-low p-4 md:p-5 rounded-2xl shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                </div>
                <div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Now Playing</div>
                  <div className="font-headline-sm text-[16px] text-on-surface font-bold flex items-center gap-2">
                    {SOUND_LABELS[activeSound]}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        playing ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {playing ? 'Active' : 'Paused'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <button
                    type="button"
                    onClick={() => setMuted(m => !m)}
                    className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    <span className="material-symbols-outlined text-[20px]">{muted ? 'volume_off' : 'volume_up'}</span>
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={e => setVolume(Number(e.target.value))}
                    className="w-28 accent-primary h-2 rounded-lg cursor-pointer bg-surface-variant"
                    aria-label="Volume"
                  />
                  <span className="font-label-sm text-label-sm text-on-surface-variant w-7">{volume}%</span>
                </div>

                <button
                  type="button"
                  onClick={toggleMaster}
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">{playing ? 'pause' : 'play_arrow'}</span>
                  <span>{playing ? 'Pause' : 'Play'}</span>
                </button>
              </div>
            </div>

            {soundError && (
              <p className="-mt-3 mb-6 px-2 font-label-md text-label-md text-error">{soundError}</p>
            )}

            {/* Sound cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {SOUNDS.map(({ key, emoji, title, desc }) => {
                const isActive = activeSound === key && playing;
                const isSelected = activeSound === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTrack(key)}
                    className={`group cursor-pointer p-4 rounded-2xl shadow-sm transition-all flex flex-col justify-between relative overflow-hidden text-left ${
                      isActive
                        ? 'bg-surface-bright ring-2 ring-primary'
                        : isSelected
                        ? 'bg-surface-bright ring-1 ring-outline-variant'
                        : 'bg-surface-container-lowest hover:bg-surface-bright hover:shadow-[0_8px_24px_-4px_rgba(41,37,36,0.1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{emoji}</span>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <div className="flex items-end gap-0.5 h-4">
                            {[3, 4, 2].map((h, i) => (
                              <span
                                key={i}
                                className="w-1 bg-primary rounded-full"
                                style={{ height: h * 4, animation: `breatheExpand 0.8s ease-in-out infinite ${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        )}
                        {/* Play / Pause button */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-high text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {isActive ? 'pause' : 'play_arrow'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-[16px] text-on-surface font-semibold">{title}</h3>
                      <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ══════════════════════════════════════ SECTION 04: PAX NOTE ══ */}
          <section className="py-10">
            <div className="bg-surface-container-lowest rounded-2xl p-8 md:p-10 shadow-[0_2px_8px_-2px_rgba(41,37,36,0.05)] flex flex-col md:flex-row items-center gap-8">
              <img alt="Pax holding tea" src={PAX_IMG} className="w-28 h-28 object-contain shrink-0" />
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">A note from Pax</h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  "You don't have to do everything today. Sometimes the bravest thing you can do is just sit here and breathe.
                  I'm proud of you for showing up. Take your time — I'll be right here."
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <CelebrationModal
          onClose={() => setShowCelebration(false)}
          message="🪨 Pebble cleared!"
          subMessage="One less thing weighing on your mind. Nice work!"
        />
      )}
    </div>
  );
}