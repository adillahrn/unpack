import { useState } from 'react';

interface BagItem {
  id: string;
  title: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  urgency: 'high' | 'medium' | 'low';
  urgencyLabel: string;
  detail: string;
  completed: boolean;
}

const initialItems: BagItem[] = [
  { id: '1', title: 'Algorithm Assignment (3000 words)', category: 'Academic', categoryIcon: 'school', categoryColor: 'primary', urgency: 'high', urgencyLabel: 'High Urgency', detail: 'Due Friday midnight • 35% grade', completed: false },
  { id: '2', title: 'Reply to mom\'s message', category: 'Personal', categoryIcon: 'person', categoryColor: 'secondary', urgency: 'medium', urgencyLabel: 'Med Urgency', detail: 'She asked about weekend plans', completed: false },
  { id: '3', title: 'Group presentation slides', category: 'Teamwork', categoryIcon: 'groups', categoryColor: 'tertiary', urgency: 'medium', urgencyLabel: 'Med Urgency', detail: 'Half-done • Waiting on Alex', completed: false },
  { id: '4', title: 'Buy groceries', category: 'Personal', categoryIcon: 'shopping_cart', categoryColor: 'secondary', urgency: 'low', urgencyLabel: 'Low Urgency', detail: 'Fridge is basically empty', completed: true },
];

const filters = ['All', 'Urgent', 'Academic', 'Personal', 'Teamwork'];

export default function MyBag() {
  const [items, setItems] = useState<BagItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [highlightedSlot, setHighlightedSlot] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Urgent') return item.urgency === 'high';
    return item.category === activeFilter;
  });

  const pendingCount = items.filter(i => !i.completed).length;
  const completedCount = items.filter(i => i.completed).length;

  const urgencyBorderColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-l-error';
      case 'medium': return 'border-l-tertiary-fixed-dim';
      case 'low': return 'border-l-secondary';
      default: return 'border-l-outline-variant';
    }
  };

  const urgencyBadge = (urgency: string, label: string) => {
    switch (urgency) {
      case 'high': return <span className="flex items-center gap-1 font-label-sm text-error bg-error-container/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"><span className="material-symbols-outlined text-[14px]">priority_high</span>{label}</span>;
      case 'medium': return <span className="flex items-center gap-1 font-label-sm text-tertiary bg-tertiary-container/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"><span className="material-symbols-outlined text-[14px]">schedule</span>{label}</span>;
      case 'low': return <span className="flex items-center gap-1 font-label-sm text-secondary bg-secondary-container/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider"><span className="material-symbols-outlined text-[14px]">check</span>{label}</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl pb-[120px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-md mb-space-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Your Backpack</h1>
          <p className="font-body-md text-on-surface-variant">{pendingCount} item{pendingCount !== 1 ? 's' : ''} to carry • {completedCount} completed</p>
        </div>
        <div className="flex gap-space-sm">
          <button
            onClick={() => setShowBreathingModal(true)}
            className="px-space-md py-space-sm rounded-full bg-secondary-container text-on-secondary-container font-label-md flex items-center gap-1 hover:bg-secondary-fixed transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">air</span>
            Breathe
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-space-md py-space-sm rounded-full bg-primary text-on-primary font-label-md flex items-center gap-1 shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Pack New Thought
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-gutter-desktop items-start">

        {/* Left: Visual Backpack */}
        <aside className="bg-surface-container-lowest rounded-3xl p-space-lg border border-outline-variant/30 shadow-sm flex flex-col items-center">
          <div className="relative w-48 h-56 mb-space-md">
            {/* Backpack body */}
            <div className="absolute inset-0 bg-primary-fixed rounded-3xl rounded-b-[40px] shadow-inner"></div>
            {/* Straps */}
            <div className="absolute top-0 left-4 w-3 h-16 bg-primary-fixed-dim rounded-full"></div>
            <div className="absolute top-0 right-4 w-3 h-16 bg-primary-fixed-dim rounded-full"></div>
            {/* Pockets */}
            <button onClick={() => setHighlightedSlot('top')} className={`absolute top-4 left-1/2 -translate-x-1/2 w-28 h-10 rounded-xl border-2 border-dashed transition-colors ${highlightedSlot === 'top' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface/30'} flex items-center justify-center`}>
              <span className="font-label-sm text-[10px] text-on-surface-variant">Top Pocket</span>
            </button>
            <button onClick={() => setHighlightedSlot('main')} className={`absolute top-[60px] left-1/2 -translate-x-1/2 w-36 h-20 rounded-2xl border-2 border-dashed transition-colors ${highlightedSlot === 'main' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface/30'} flex items-center justify-center`}>
              <span className="font-label-sm text-[10px] text-on-surface-variant">Main Pocket</span>
            </button>
            <button onClick={() => setHighlightedSlot('front')} className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-12 rounded-xl border-2 border-dashed transition-colors ${highlightedSlot === 'front' ? 'border-primary bg-primary/10' : 'border-outline-variant bg-surface/30'} flex items-center justify-center`}>
              <span className="font-label-sm text-[10px] text-on-surface-variant">Front Pocket</span>
            </button>
          </div>
          <p className="font-label-md text-on-surface-variant text-center">Click a pocket to highlight items</p>
          <div className="w-full mt-space-md pt-space-md border-t border-outline-variant/30">
            <div className="flex justify-between font-label-sm text-on-surface-variant mb-2">
              <span>Load capacity</span>
              <span>{pendingCount} / 10</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(pendingCount * 10, 100)}%` }}></div>
            </div>
          </div>
        </aside>

        {/* Right: Item List */}
        <div className="flex flex-col gap-space-md">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 px-3 py-1.5 rounded-full font-label-sm border transition-colors ${
                  activeFilter === filter
                    ? 'bg-surface-variant border-outline text-on-surface font-bold'
                    : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-space-sm">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={`bg-surface-container-lowest rounded-2xl p-space-md border-l-4 ${urgencyBorderColor(item.urgency)} border border-l-4 border-outline-variant/40 flex items-start gap-space-md relative overflow-hidden transition-all ${item.completed ? 'opacity-60' : 'hover:shadow-md'}`}
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    item.completed ? 'bg-secondary border-secondary' : 'border-outline-variant hover:border-primary'
                  }`}
                >
                  {item.completed && <span className="material-symbols-outlined text-on-secondary text-[16px]">check</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    {urgencyBadge(item.urgency, item.urgencyLabel)}
                  </div>
                  <h3 className={`font-headline-sm text-on-surface leading-tight mt-1 ${item.completed ? 'line-through text-outline' : ''}`}>{item.title}</h3>
                  <p className="font-label-sm text-on-surface-variant mt-1">{item.detail}</p>
                  <div className="flex items-center gap-space-xs mt-space-sm">
                    <span className={`px-2 py-1 bg-${item.categoryColor}-fixed/30 rounded text-[11px] font-label-sm flex items-center gap-1`}>
                      <span className="material-symbols-outlined text-[12px]">{item.categoryIcon}</span>
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-surface-variant/80 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-[440px] rounded-[32px] p-space-xl shadow-[0_16px_48px_rgba(41,37,36,0.1)] border border-outline-variant/30 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
            </button>
            <h2 className="font-headline-md text-on-surface mb-space-md">Pack a New Thought</h2>
            <div className="flex flex-col gap-space-md">
              <input type="text" placeholder="What's on your mind?" className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
              <select className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none">
                <option>Academic</option>
                <option>Personal</option>
                <option>Teamwork</option>
              </select>
              <button className="w-full py-space-md rounded-full bg-primary text-on-primary font-label-lg shadow-md hover:bg-primary/90 transition-colors">
                Add to Backpack
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breathing Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-surface-variant/80 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-[400px] rounded-[32px] p-space-xl shadow-[0_16px_48px_rgba(41,37,36,0.1)] border border-outline-variant/30 text-center relative">
            <button onClick={() => setShowBreathingModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">close</span>
            </button>
            <div className="w-24 h-24 mx-auto rounded-full bg-secondary-container/40 flex items-center justify-center mb-space-lg animate-[pulse_4s_ease-in-out_infinite]">
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-on-secondary-container">air</span>
              </div>
            </div>
            <h2 className="font-headline-md text-on-surface mb-space-xs">Box Breathing</h2>
            <p className="font-body-md text-on-surface-variant mb-space-lg">Breathe in 4s • Hold 4s • Out 4s • Hold 4s</p>
            <p className="font-headline-lg text-primary animate-pulse">Inhale...</p>
          </div>
        </div>
      )}
    </div>
  );
}
