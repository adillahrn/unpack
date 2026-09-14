import { BaggageItem } from '@/types';

interface BackpackProps {
  items: BaggageItem[];
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
};

export default function Backpack({ items, size = 'md' }: BackpackProps) {
  const pendingCount = items.filter(i => i.status !== 'completed').length;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} animate-float`} role="img" aria-label="Backpack">
        🎒
      </div>
      <p className="text-bark/70 font-medium">
        {pendingCount === 0
          ? 'Nothing to carry right now!'
          : `${pendingCount} thing${pendingCount > 1 ? 's' : ''} you're carrying`}
      </p>
    </div>
  );
}
