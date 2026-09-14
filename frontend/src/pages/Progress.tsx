import Pax from '@/components/Pax';
import Backpack from '@/components/Backpack';

// Demo stats
const stats = [
  { label: 'Things unpacked', value: 7 },
  { label: 'Steps completed', value: 5 },
  { label: 'Focus sessions', value: 4 },
];

export default function Progress() {
  return (
    <div className="flex flex-col items-center py-8 gap-8">
      <h1 className="text-2xl font-bold text-midnight">YOUR JOURNEY</h1>

      <div className="text-center">
        <p className="text-bark/70 mb-2">You've unpacked</p>
        <p className="text-4xl font-bold text-coral">7 things</p>
        <p className="text-bark/70">this week.</p>
      </div>

      <Backpack items={[]} size="md" />

      <div className="w-full max-w-sm space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between bg-white rounded-2xl px-5 py-4 shadow-sm"
          >
            <span className="text-bark/70 font-medium">{stat.label}</span>
            <span className="text-xl font-bold text-midnight">{stat.value}</span>
          </div>
        ))}
      </div>

      <Pax state="happy" size="sm" />
    </div>
  );
}
