import Pax from '@/components/Pax';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({
  title = 'Your bag is empty 🎒',
  message = 'Nothing to carry right now.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
      <Pax state="happy" size="md" />
      <h3 className="text-xl font-bold text-midnight">{title}</h3>
      <p className="text-bark/70">{message}</p>
    </div>
  );
}
