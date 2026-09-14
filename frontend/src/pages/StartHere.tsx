import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function StartHere() {
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const duration = 10 * 60; // 10 minutes total

  useEffect(() => {
    let interval: number | undefined;
    if (timerState === 'running' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerState('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState, timeLeft]);

  const toggleTimer = () => {
    if (timerState === 'idle' || timerState === 'paused') {
      setTimerState('running');
    } else if (timerState === 'running') {
      setTimerState('paused');
    }
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeLeft(duration);
  };

  const toggleSound = (sound: string) => {
    if (activeSound === sound) {
      setActiveSound(null);
    } else {
      setActiveSound(sound);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate SVG circle stroke dashoffset
  const circleRadius = 120;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (timeLeft / duration) * circleCircumference;

  return (
    <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl pb-[120px]">
      
      {/* Phase Indicator */}
      <div className="mb-space-lg flex items-center justify-between">
        <div className="flex items-center gap-space-sm text-label-lg font-label-lg">
          <span className="text-on-tertiary bg-tertiary px-3 py-1 rounded-full flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
            Focus Mode
          </span>
          <span className="text-on-surface-variant">Anti-overwhelm</span>
        </div>
        
        <Link to="/unpack" className="text-primary font-label-md hover:bg-primary-fixed/30 px-3 py-1 rounded-full transition-colors">
          Change task
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-gutter-desktop relative items-start">
        
        {/* Left Column: Timer Area */}
        <div className="flex flex-col gap-space-lg">
          
          {/* Primary Action Card */}
          <section className="bg-surface-container-lowest rounded-[32px] p-space-xl border border-outline-variant/30 shadow-[0_8px_32px_rgba(41,37,36,0.04)] flex flex-col items-center text-center relative overflow-hidden">
            
            {/* Background flourish */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-fixed/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col items-center gap-space-xs mb-space-xl relative z-10">
              <span className="px-3 py-1 bg-primary-fixed/30 text-on-primary-fixed rounded-full text-[12px] font-label-sm flex items-center gap-1 mb-2">
                <span className="material-symbols-outlined text-[14px]">school</span> Academic
              </span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-on-surface leading-tight">Algorithm Assignment</h1>
              <p className="font-body-lg text-on-surface-variant max-w-[400px]">Open a blank document and write just the title and your name.</p>
            </div>

            {/* Timer Visual */}
            <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-space-xl z-10">
              {/* SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 260 260">
                <circle 
                  cx="130" cy="130" r="120" 
                  className="stroke-surface-variant fill-none"
                  strokeWidth="8"
                />
                <circle 
                  cx="130" cy="130" r="120" 
                  className="stroke-tertiary fill-none transition-all duration-1000 ease-linear"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              
              <div className="flex flex-col items-center">
                <span className="font-display-lg text-[64px] text-on-surface tabular-nums tracking-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="font-label-md text-outline">minutes</span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-space-md z-10">
              <button 
                onClick={resetTimer}
                className="w-12 h-12 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                title="Reset timer"
              >
                <span className="material-symbols-outlined">restart_alt</span>
              </button>
              
              <button 
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center shadow-[0_4px_16px_rgba(130,81,0,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-[36px] filled">
                  {timerState === 'running' ? 'pause' : 'play_arrow'}
                </span>
              </button>
              
              <button 
                onClick={() => setTimerState('completed')}
                className="w-12 h-12 rounded-full border border-outline-variant text-on-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors"
                title="Skip to end"
              >
                <span className="material-symbols-outlined">skip_next</span>
              </button>
            </div>
          </section>

        </div>

        {/* Right Column */}
        <aside className="flex flex-col gap-space-md">
          
          {/* Ambience Widget */}
          <div className="bg-surface-container-lowest rounded-3xl p-space-md border border-outline-variant/30 shadow-sm">
            <h3 className="font-headline-sm text-on-surface mb-space-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">headphones</span>
              Focus Ambience
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'rain', icon: 'rainy', label: 'Rain' },
                { id: 'cafe', icon: 'local_cafe', label: 'Cafe' },
                { id: 'fire', icon: 'local_fire_department', label: 'Fire' },
                { id: 'wind', icon: 'air', label: 'Wind' },
              ].map(sound => (
                <button 
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 border transition-colors ${
                    activeSound === sound.id
                      ? 'bg-secondary-container/30 border-secondary text-on-secondary-container'
                      : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined ${activeSound === sound.id ? 'filled' : ''}`}>{sound.icon}</span>
                  <span className="font-label-sm">{sound.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pax Encouragement */}
          <div className="bg-primary-fixed/20 border border-primary-fixed rounded-3xl p-space-md flex items-center gap-space-sm">
            <img src="https://lh3.googleusercontent.com/aida/AEtjO1Ukem3LNXgKtxLVnmwa5dfQrgc7ORW4-_FtCnt3HAc1TR5-24qTooqjP6KSuAzIqnqYz03t24sHJ8tc67C8DEqed7QWkShWQziQ2TkYp7AO7D0SOZbgKglsrFSNbNVEkFyNYjgJtghrcv5ih9Ncxy12TrbRTJQE2fAPcaz3l6KCflwIV46OypXPLe63z1HSB6IGLNqO4A4z8XfJRNWmmeJf3Z5ymQM9hoV6ZZ0PlSvSCd4vdXttjQUyeCg" alt="Pax encouraging" className="w-16 h-16 object-contain" />
            <div>
              <p className="font-label-md text-on-primary-fixed-variant mb-1">Pax says:</p>
              <p className="font-body-sm text-on-surface-variant">"10 minutes is all I ask. If you want to stop after, you can."</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Completion Modal */}
      {timerState === 'completed' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-surface-variant/80 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]">
          <div className="bg-surface-container-lowest w-full max-w-[400px] rounded-[32px] p-space-xl shadow-[0_16px_48px_rgba(41,37,36,0.1)] border border-outline-variant/30 text-center relative overflow-hidden animate-[slide-up_0.4s_ease-out]">
            
            <div className="w-20 h-20 bg-secondary-container rounded-full mx-auto flex items-center justify-center mb-space-md shadow-[0_0_0_8px_rgba(108,248,187,0.2)]">
              <span className="material-symbols-outlined text-[40px] text-on-secondary-container">check_circle</span>
            </div>
            
            <h2 className="font-headline-lg text-on-surface mb-space-xs">Time's Up!</h2>
            <p className="font-body-md text-on-surface-variant mb-space-lg">You did the hardest part: starting.</p>
            
            <div className="flex flex-col gap-3">
              <Link to="/progress" className="w-full py-4 rounded-full bg-primary text-on-primary font-label-lg shadow-md hover:bg-primary/90 transition-colors">
                Mark as Complete
              </Link>
              <button 
                onClick={resetTimer}
                className="w-full py-4 rounded-full bg-surface text-primary font-label-lg border border-outline-variant hover:bg-surface-container transition-colors"
              >
                Keep going (10 more mins)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
