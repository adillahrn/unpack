import { useState } from 'react';
import QuestCard from '@/components/QuestCard';
import Timer from '@/components/Timer';
import Pax from '@/components/Pax';
import { Quest, BaggageItem } from '@/types';

// Demo data
const demoBaggage: BaggageItem = {
  id: '1',
  unload_id: 'u1',
  title: 'Algorithm Assignment',
  category: 'academic',
  urgency: 'high',
  status: 'pending',
  created_at: new Date().toISOString(),
};

const demoQuest: Quest = {
  id: 'q1',
  user_id: 'u1',
  baggage_id: '1',
  title: 'Open your assignment and write the first 3 points.',
  duration: 10,
  xp: 20,
  status: 'pending',
  created_at: new Date().toISOString(),
};

export default function StartHere() {
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  const handleStart = () => {
    setTimerActive(true);
  };

  const handleComplete = () => {
    setTimerActive(false);
    setActiveQuest(null);
  };

  if (timerActive && activeQuest) {
    return (
      <div className="py-8">
        <Timer
          durationMinutes={activeQuest.duration}
          taskTitle={demoBaggage.title}
          onComplete={handleComplete}
          onCancel={() => setTimerActive(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <Pax state="encouraging" size="md" />
      <p className="text-bark/70 text-center max-w-md">
        You don't have to solve everything right now.
      </p>

      <QuestCard
        quest={demoQuest}
        baggageItem={demoBaggage}
        onStart={() => {
          setActiveQuest(demoQuest);
          handleStart();
        }}
      />
    </div>
  );
}
