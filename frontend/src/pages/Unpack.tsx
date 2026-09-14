import { useState } from 'react';
import Button from '@/components/ui/Button';
import Pax from '@/components/Pax';
import LoadingState from '@/components/states/LoadingState';
import ErrorState from '@/components/states/ErrorState';

type UnpackState = 'empty' | 'typing' | 'loading' | 'success' | 'error';

export default function Unpack() {
  const [text, setText] = useState('');
  const [state, setState] = useState<UnpackState>('empty');

  const handleUnpack = async () => {
    if (!text.trim()) return;
    setState('loading');
    // TODO: Call Supabase Edge Function
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setState('success');
      // TODO: Navigate to /my-bag with results
    } catch {
      setState('error');
    }
  };

  if (state === 'loading') {
    return <LoadingState message="Pax is unpacking your thoughts..." />;
  }

  if (state === 'error') {
    return <ErrorState onRetry={() => setState('typing')} />;
  }

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6 animate-fade-in">
        <Pax state="happy" size="lg" />
        <p className="text-2xl font-bold text-coral">✨ Unpacked!</p>
        <p className="text-bark/70">Check your bag to see what you're carrying.</p>
        <Button onClick={() => { setText(''); setState('empty'); }}>Unpack Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <Pax state="idle" size="md" />
      <h1 className="text-2xl font-bold text-midnight">What's on your mind?</h1>

      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setState(e.target.value.trim() ? 'typing' : 'empty');
        }}
        placeholder="I have so many things..."
        className="w-full max-w-lg h-40 rounded-2xl border border-peach/30 p-4 bg-white text-midnight resize-none focus:outline-none focus:ring-2 focus:ring-coral/30 transition-colors placeholder:text-bark/30"
        aria-label="Write what's on your mind"
      />

      <Button
        onClick={handleUnpack}
        disabled={!text.trim()}
        size="lg"
      >
        Unpack My Mind
      </Button>
    </div>
  );
}
