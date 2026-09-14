import { useState } from 'react';
import Backpack from '@/components/Backpack';
import BaggageCard from '@/components/BaggageCard';
import EmptyState from '@/components/states/EmptyState';
import { BaggageItem } from '@/types';

// Demo data for skeleton
const demoItems: BaggageItem[] = [
  {
    id: '1',
    unload_id: 'u1',
    title: 'Algorithm Assignment',
    category: 'academic',
    urgency: 'high',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    unload_id: 'u1',
    title: 'Presentation',
    category: 'deadline',
    urgency: 'high',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    unload_id: 'u1',
    title: 'Reply to Friend',
    category: 'social',
    urgency: 'medium',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export default function MyBag() {
  const [items, setItems] = useState<BaggageItem[]>(demoItems);

  const handleStatusChange = (id: string, status: BaggageItem['status']) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const pendingItems = items.filter(i => i.status !== 'completed');
  const completedItems = items.filter(i => i.status === 'completed');

  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <h1 className="text-2xl font-bold text-midnight">YOUR BAG</h1>
      <Backpack items={items} />

      <div className="w-full max-w-lg space-y-3">
        {pendingItems.map(item => (
          <BaggageCard key={item.id} item={item} onStatusChange={handleStatusChange} />
        ))}
      </div>

      {completedItems.length > 0 && (
        <div className="w-full max-w-lg">
          <p className="text-sm font-medium text-bark/50 mb-3">Completed</p>
          <div className="space-y-3">
            {completedItems.map(item => (
              <BaggageCard key={item.id} item={item} />
            ))}
          </div>
          <p className="text-center text-sage font-medium mt-4">✨ One less thing to carry.</p>
        </div>
      )}
    </div>
  );
}
