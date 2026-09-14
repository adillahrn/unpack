import { Quest, BaggageItem } from '@/types';
import Button from '@/components/ui/Button';
import { Clock, Sparkles } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  baggageItem?: BaggageItem;
  onStart?: (questId: string) => void;
}

export default function QuestCard({ quest, baggageItem, onStart }: QuestCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-peach/20 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-coral" />
        <span className="text-sm font-medium text-coral">START HERE</span>
      </div>

      {baggageItem && (
        <p className="text-sm text-bark/60 mb-2">
          📚 {baggageItem.title}
        </p>
      )}

      <h3 className="text-lg font-bold text-midnight mb-2">First step:</h3>
      <p className="text-bark/80 mb-4">{quest.title}</p>

      <div className="flex items-center gap-2 text-bark/50 text-sm mb-4">
        <Clock size={14} />
        <span>~ {quest.duration} minutes</span>
      </div>

      {onStart && quest.status === 'pending' && (
        <Button onClick={() => onStart(quest.id)} size="md">
          Start {quest.duration} min
        </Button>
      )}
    </div>
  );
}
