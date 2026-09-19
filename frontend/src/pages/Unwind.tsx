import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

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
  rain: '/rainsound.mp3',
  library: '/sounds/quiet-library.mp3',
  wind: '/sounds/gentle-wind.mp3',
  cafe: '/sounds/late-night-cafe.mp3',
  night: '/room.mp3',
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

function getMicroStep(item: DBBaggageItem): { text: string; duration: number } {
  const step = item.action_step?.trim();
  if (step && !PLACEHOLDER_STEPS.includes(step)) return { text: step, duration: 10 };
  if (item.category === 'academic')  return { text: 'Open the file and identify the easiest part to start with.', duration: 10 };
  if (item.category === 'deadline')  return { text: 'Write down the one thing you must remember for this deadline.', duration: 5 };
  if (item.category === 'social')    return { text: 'Send one short message to check in with whoever is involved.', duration: 5 };
  if (item.category === 'health')    return { text: 'Do one small thing for your body: water, stretch, or a short walk.', duration: 5 };
  if (item.category === 'financial') return { text: 'Open your banking app and just look at the number. No decisions yet.', duration: 5 };
  return { text: 'Write down three things you remember about this task.', duration: 10 };
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

      <div className="w-full h-56 bg-gradient-to-t from-surface-container to-[#fed7aa]/30 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4">
        {floating && !released && (
          <div
            className="absolute bg-surface-container-lowest px-space-md py-space-sm rounded-xl shadow-lg font-body-sm text-[14px] text-on-surface max-w-[260px] text-center"
            style={{ animation: 'floatUp 3.5s ease-in forwards', bottom: 16 }}
            onAnimationEnd={() => setReleased(true)}
          >
            <span className="text-lg mr-1">{'\u{1F388}'}</span>
            {thought}
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
function PlantModal() {
  const [stage, setStage]       = useState<PlantStage>(0);
  const [feedback, setFeedback] = useState('Sprout is resting peacefully.');

  const emojis: Record<PlantStage, string> = {
    0: '\u{1F331}',
    1: '\u{1FAB4}',
    2: '\u{1F33F}',
    3: '\u{1F338}',
  };

  const care = (type: 'water' | 'sun') => {
    const next = Math.min(stage + 1, 3) as PlantStage;
    setStage(next);
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

      <div className="w-full h-60 bg-surface-container-low/60 rounded-2xl flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center transition-all duration-700">
          <span className="text-5xl" style={{ animation: stage > 0 ? 'plantGrow 0.6s ease-out' : 'none' }}>
            {emojis[stage]}
          </span>
          <div className="w-20 h-14 bg-[#e2e8f0] rounded-b-2xl rounded-t-sm shadow-md flex items-center justify-center relative mt-2">
            <div className="w-3.5 h-6 rounded-r-md border-2 border-l-0 border-stone-300 absolute -right-3 top-3" />
            <span className="text-[11px] font-bold text-stone-500">pax mug</span>
          </div>
        </div>
        <p className="mt-3 font-label-sm text-label-sm text-tertiary font-semibold text-center">{feedback}</p>
      </div>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => care('water')}
          disabled={stage >= 3}
          className="px-5 py-2.5 rounded-full bg-[#0284c7] text-white font-label-md text-label-md shadow-[0_3px_0_#0369a1] active:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span>Water Plant</span> {'\u{1F4A7}'}
        </button>
        <button
          type="button"
          onClick={() => care('sun')}
          disabled={stage >= 3}
          className="px-5 py-2.5 rounded-full bg-[#eab308] text-on-surface font-label-md text-label-md shadow-[0_3px_0_#ca8a04] active:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <span>Give Sunlight</span> {'\u{2600}\u{FE0F}'}
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
  const ms    = getMicroStep(item);
  const TOTAL = ms.duration * 60;

  const [rem, setRem]         = useState(TOTAL);
  const [running, setRunning] = useState(true);
  const [done, setDone]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const finishedRef           = useRef(false);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const wLabel = item.urgency === 'high' ? 'Heavy' : item.urgency === 'medium' ? 'Moderate' : 'Light';

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
        {ms.duration}-Minute Protected Sprint
      </span>
      <h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">One thing. That's all.</h3>
      <p className="font-label-md text-label-md text-primary font-bold mt-2 max-w-sm">{item.title}</p>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">{ms.text}</p>

      <div className="my-6 p-6 rounded-2xl bg-surface-container-low w-full flex flex-col items-center">
        <div className="font-display-lg text-[64px] leading-tight text-primary font-extrabold tracking-tight tabular-nums">{fmt(rem)}</div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Focus window {running ? 'running' : 'paused'}</div>
      </div>

      <div className="bg-[#fef9c3]/60 p-4 rounded-xl flex items-center gap-3 text-left w-full mb-6">
        <img alt="Pax" className="w-8 h-8 object-contain shrink-0" src={PAX_IMG} />
        <p className="font-body-sm text-[13.5px] text-on-surface italic">
          "I'll stay right here. You don't need to think about the next thing yet."
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setRunning(r => !r)}
          className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] active:translate-y-[2px] transition-all cursor-pointer"
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={finish}
          className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
        >
          Finish Early
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Unwind() {
  const [openModal, setOpenModal]     = useState<ModalId>(null);
  const [activeSound, setActiveSound] = useState<SoundKey>('rain');
  const [playing, setPlaying]         = useState(false);
  const [volume, setVolume]           = useState(65);
  const [muted, setMuted]             = useState(false);
  const [soundError, setSoundError]   = useState<string | null>(null);

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
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {[
                    { dot: 'bg-secondary', label: '0% expectation' },
                    { dot: 'bg-primary',   label: 'Pick any drawer' },
                    { dot: 'bg-tertiary',  label: 'Stay as long as needed' },
                  ].map(({ dot, label }) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">
                      <span className={`w-2 h-2 rounded-full ${dot}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═════════════════════════════════════════ SECTION 01: RESETS ══ */}
          <section className="py-8" id="quick-resets-section">
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

          {/* ══════════════════════════════════════════ SECTION 02: SOUND ══ */}
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
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchTrack(key)}
                    className={`group cursor-pointer p-4 rounded-2xl shadow-sm transition-all flex flex-col justify-between relative overflow-hidden text-left ${
                      isActive
                        ? 'bg-surface-bright ring-2 ring-primary'
                        : 'bg-surface-container-lowest hover:bg-surface-bright hover:shadow-[0_8px_24px_-4px_rgba(41,37,36,0.1)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{emoji}</span>
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
                    </div>

                    <div>
                      <h3 className="font-headline-sm text-[16px] text-on-surface font-semibold">{title}</h3>
                      <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">{desc}</p>
                    </div>

                    <div className={`mt-4 pt-2 flex items-center justify-between font-label-sm text-[12px] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                      <span className={isActive ? 'font-bold' : ''}>{isActive ? 'Playing' : 'Tap to play'}</span>
                      <span className="material-symbols-outlined text-[16px]">{isActive ? 'equalizer' : 'play_circle'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ═══════════════════════════════════ SECTION 03: SMALL ACTION ══ */}
          <section className="py-10 mb-8" id="small-action-section">
            <div className="bg-surface-container-low/70 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute -top-3 right-12 w-28 h-6 bg-[#fed7aa]/70 shadow-sm rotate-[2.5deg] z-10 pointer-events-none rounded-[2px]" />

              <div className="max-w-3xl">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">{'\u{1F331}'} Small Action</h2>
                <p className="font-headline-sm text-[18px] text-primary font-semibold mt-1">Feeling ready for one small step?</p>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                  Not another to-do list. Just permission to start without needing to finish. Frictionless movement to unfreeze academic paralysis.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: task card */}
                <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_8px_20px_-4px_rgba(41,37,36,0.08)] relative">
                  {/* Loading */}
                  {loadingItems && (
                    <div className="h-32 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                    </div>
                  )}

                  {/* Error */}
                  {!loadingItems && itemsError && (
                    <div className="py-4 text-center">
                      <p className="font-body-md text-body-md text-error">{itemsError}</p>
                      <button
                        type="button"
                        onClick={loadItems}
                        className="mt-3 px-5 py-2 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {/* Empty */}
                  {!loadingItems && !itemsError && !bagItem && (
                    <div className="py-4 text-center">
                      <div className="text-3xl mb-2">{'\u{1F392}'}</div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">Your bag is clear for now.</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                        Nothing is waiting. If something is on your mind, you can pack it.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <Link
                          to="/unpack"
                          className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] cursor-pointer"
                        >
                          Unpack your mind
                        </Link>
                        <Link
                          to="/my-bag"
                          className="px-5 py-2.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors cursor-pointer"
                        >
                          Open My Bag
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Item */}
                  {!loadingItems && !itemsError && bagItem && ms && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-label-sm font-bold">From My Bag</span>
                          <span className="text-on-surface-variant text-sm">
                            {bagItem.status === 'in_progress'
                              ? '· In progress'
                              : bagItem.urgency === 'high'
                              ? '· Urgent'
                              : '· Pending'}
                          </span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-secondary-container/80 text-on-secondary-container font-label-sm text-label-sm flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[15px]">timer</span>
                          {ms.duration} minutes only · Frictionless start
                        </span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="text-2xl mt-0.5">{bagItem.urgency === 'high' ? '\u{1F393}' : '\u{1F4CC}'}</div>
                        <div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">{bagItem.title}</h3>
                          <div className="mt-2 text-on-surface-variant font-body-md text-body-md">
                            <span className="font-semibold text-on-surface">Next tiny move: </span>
                            {ms.text}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={startAction}
                          className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                          <span>Start {ms.duration}-minute step</span>
                        </button>

                        <button
                          type="button"
                          onClick={pickAnother}
                          disabled={items.length <= 1}
                          className="px-5 py-3 rounded-full bg-surface-container text-on-surface hover:bg-surface-variant font-label-md text-label-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[18px]">cached</span>
                          <span>Pick another tiny step</span>
                          {items.length > 1 && (
                            <span className="text-on-surface-variant text-[12px]">{itemIndex + 1}/{items.length}</span>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Pax widget */}
                <div className="lg:col-span-4 bg-[#fef9c3]/70 p-5 rounded-2xl shadow-sm flex flex-col justify-between self-stretch">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-sm">
                      <img alt="Pax" className="w-7 h-7 object-contain" src={PAX_IMG} />
                    </div>
                    <div>
                      <div className="font-headline-sm text-[15px] text-on-surface font-bold">Pax's Reminder</div>
                    </div>
                  </div>
                  <p className="font-body-md text-[14px] text-on-surface leading-relaxed italic">
                    "You don't have to fix everything. Maybe just one tiny thing."
                  </p>
                  <div className="mt-4 pt-3 flex items-center gap-2 text-tertiary font-label-sm text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[16px]">energy_savings_leaf</span>
                    <span>Low friction · High relief</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}