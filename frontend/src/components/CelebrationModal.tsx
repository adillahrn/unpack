import { useEffect, useRef, useCallback } from 'react';

interface Props {
  onClose: () => void;
  message?: string;
  subMessage?: string;
}

// ─── Tring sound via Web Audio API ───────────────────────────────────────────
function playTring() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Three rising notes — C6, E6, G6 — arpeggio "tring"
    const notes = [
      { freq: 1046.5, start: 0.00 },  // C6
      { freq: 1318.5, start: 0.10 },  // E6
      { freq: 1568.0, start: 0.20 },  // G6
    ];

    notes.forEach(({ freq, start }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + 0.65);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + 0.7);
    });
  } catch {
    // AudioContext unavailable — silently skip
  }
}

// ─── Confetti particle system ─────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  width: number;
  height: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

const CONFETTI_COLORS = [
  '#7C3AED', // violet
  '#059669', // emerald
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EC4899', // pink
  '#10B981', // teal
  '#F97316', // orange
  '#6366F1', // indigo
];

function createParticles(canvasW: number, canvasH: number): Particle[] {
  return Array.from({ length: 90 }, () => ({
    x: Math.random() * canvasW,
    y: -20 - Math.random() * 100,
    vx: (Math.random() - 0.5) * 4,
    vy: 2 + Math.random() * 4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.15,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]!,
    width: 6 + Math.random() * 8,
    height: 3 + Math.random() * 5,
    opacity: 0.85 + Math.random() * 0.15,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }));
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CelebrationModal({ onClose, message, subMessage }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(performance.now());

  // Auto-dismiss after 3.2 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Play tring on mount
  useEffect(() => {
    playTring();
  }, []);

  // Run confetti animation
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    let allGone = true;

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07; // gravity
      p.rotation += p.rotationSpeed;

      // fade out after 2 seconds
      if (elapsed > 2) p.opacity = Math.max(0, p.opacity - 0.018);
      if (p.opacity > 0.01) allGone = false;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }
      ctx.restore();
    }

    if (!allGone) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    particlesRef.current = createParticles(canvas.width, canvas.height);
    startTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [animate]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-scrim/30 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Card */}
      <div
        className="relative z-10 bg-surface-container-lowest rounded-3xl p-8 md:p-10 shadow-2xl max-w-sm w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'celebrationPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Animated logo */}
        <div
          className="mx-auto mb-5 w-24 h-24 rounded-full bg-primary-fixed flex items-center justify-center shadow-lg"
          style={{ animation: 'logoBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both' }}
        >
          <img
            src="/unpack_logo.png"
            alt="Unpack"
            className="w-14 h-14 object-contain"
            style={{ animation: 'logoWiggle 0.5s ease-in-out 0.55s 2 both' }}
          />
        </div>

        <h2
          className="font-headline-lg text-headline-lg text-on-surface font-bold mb-2"
          style={{ animation: 'fadeSlideUp 0.4s ease 0.3s both' }}
        >
          {message ?? '🎉 Pebble cleared!'}
        </h2>

        <p
          className="font-body-md text-body-md text-on-surface-variant mb-6"
          style={{ animation: 'fadeSlideUp 0.4s ease 0.4s both' }}
        >
          {subMessage ?? 'One less thing weighing on your mind.'}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="px-8 py-3 rounded-full bg-primary text-on-primary font-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
          style={{ animation: 'fadeSlideUp 0.4s ease 0.5s both' }}
        >
          Keep going ✨
        </button>
      </div>

      {/* Keyframe styles injected via style tag */}
      <style>{`
        @keyframes celebrationPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes logoBounce {
          from { opacity: 0; transform: scale(0.3) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes logoWiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25%       { transform: rotate(-12deg) scale(1.1); }
          75%       { transform: rotate(12deg) scale(1.1); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
