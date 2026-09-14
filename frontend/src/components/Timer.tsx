import { useState, useEffect, useCallback } from 'react';
import Pax from '@/components/Pax';
import Button from '@/components/ui/Button';

interface TimerProps {
  durationMinutes: number;
  taskTitle: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export default function Timer({ durationMinutes, taskTitle, onComplete, onCancel }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isPaused || isCompleted) return;
    if (secondsLeft <= 0) {
      setIsCompleted(true);
      onComplete();
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, isPaused, isCompleted, onComplete]);

  const formatTime = useCallback((totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12 animate-fade-in">
        <p className="text-2xl font-bold text-coral">✨ ONE LESS THING TO CARRY</p>
        <p className="text-lg text-midnight font-semibold">{taskTitle}</p>
        <p className="text-sage font-medium">✓ Completed</p>
        <Pax state="happy" size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <p className="text-6xl font-bold text-midnight font-mono tabular-nums">
        {formatTime(secondsLeft)}
      </p>
      <p className="text-bark/70 font-medium">Focus on this one thing.</p>
      <Pax state="encouraging" size="md" />
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
