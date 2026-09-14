import { BaggageItem, BaggageCategory } from '@/types';
import { Check, Circle, Loader } from 'lucide-react';

interface BaggageCardProps {
  item: BaggageItem;
  onStatusChange?: (id: string, status: BaggageItem['status']) => void;
}

const categoryIcons: Record<BaggageCategory, string> = {
  academic: '📚',
  deadline: '🎤',
  social: '💬',
  personal: '🌱',
  health: '💚',
  financial: '💰',
  other: '📦',
};

const urgencyColors = {
  high: 'border-l-coral bg-coral/5',
  medium: 'border-l-peach bg-peach/5',
  low: 'border-l-sage bg-sage/5',
};

const urgencyDots = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

const statusIcons = {
  pending: Circle,
  in_progress: Loader,
  completed: Check,
};

export default function BaggageCard({ item, onStatusChange }: BaggageCardProps) {
  const StatusIcon = statusIcons[item.status];
  const isCompleted = item.status === 'completed';

  return (
    <div
      className={`rounded-2xl border-l-4 p-4 shadow-sm transition-all duration-300 ${
        urgencyColors[item.urgency]
      } ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label={item.category}>
            {categoryIcons[item.category]}
          </span>
          <div>
            <h3 className={`font-semibold text-midnight ${isCompleted ? 'line-through' : ''}`}>
              {item.title}
            </h3>
            <p className="text-sm text-bark/60 capitalize">{item.category}</p>
            <p className="text-xs text-bark/50 mt-1">
              {urgencyDots[item.urgency]} {item.urgency.charAt(0).toUpperCase() + item.urgency.slice(1)} urgency
            </p>
          </div>
        </div>
        {onStatusChange && (
          <button
            onClick={() => {
              const next = item.status === 'pending' ? 'in_progress' : 'completed';
              onStatusChange(item.id, next);
            }}
            className="p-2 rounded-full hover:bg-peach/30 transition-colors"
            aria-label={`Mark as ${item.status === 'pending' ? 'in progress' : 'completed'}`}
          >
            <StatusIcon size={20} className={isCompleted ? 'text-sage' : 'text-bark/40'} />
          </button>
        )}
      </div>
    </div>
  );
}
