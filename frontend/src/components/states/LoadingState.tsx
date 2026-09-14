import Pax from '@/components/Pax';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Pax is unpacking...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4 animate-fade-in">
      <Pax state="thinking" size="md" />
      <p className="text-bark/70 font-medium text-lg">{message}</p>
    </div>
  );
}
