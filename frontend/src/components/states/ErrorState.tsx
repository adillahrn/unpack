import Pax from '@/components/Pax';
import Button from '@/components/ui/Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Pax couldn't unpack that right now.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
      <Pax state="encouraging" size="md" />
      <h3 className="text-xl font-bold text-midnight">{message}</h3>
      <p className="text-bark/70">Your thoughts are still here.</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
