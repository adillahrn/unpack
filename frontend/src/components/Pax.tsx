import { PaxState } from '@/types';

interface PaxProps {
  state?: PaxState;
  size?: 'sm' | 'md' | 'lg';
}

const paxEmojis: Record<PaxState, string> = {
  idle: '🐻',
  thinking: '🤔',
  encouraging: '💪',
  happy: '😊',
  relieved: '😌',
};

const paxMessages: Record<PaxState, string> = {
  idle: '',
  thinking: 'Hmm, let me think...',
  encouraging: 'You got this!',
  happy: 'Great job!',
  relieved: 'One less thing to carry.',
};

const sizes = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
};

export default function Pax({ state = 'idle', size = 'md' }: PaxProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizes[size]} animate-bounce-gentle`} role="img" aria-label={`Pax is ${state}`}>
        {paxEmojis[state]}
      </div>
      {paxMessages[state] && (
        <p className="text-bark/60 text-sm font-medium italic">{paxMessages[state]}</p>
      )}
    </div>
  );
}
