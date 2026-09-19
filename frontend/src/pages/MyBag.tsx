import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';

interface MicroStep {
  id: string;
  label: string;
  completed: boolean;
}

interface BagItem {
  id: string;
  unload_id?: string;
  slotKey: string;
  title: string;
  titleEmoji: string;
  badgeText: string;
  badgeStyle: string;
  description: string;
  pocketName: string;
  weightLabel: string;
  weightColorClass: string;
  category: string; // space separated keywords for filtering e.g. "urgent academic"
  actionType: 'unpack' | 'microstep' | 'snooze' | 'walk' | 'default';
  actionLabel: string;
  secondaryActionLabel?: string;
  completed: boolean;
  microsteps?: MicroStep[];
  showMicrosteps?: boolean;
}

interface DBBaggageItem {
  id: string;
  unload_id: string;
  user_id: string;
  title: string;
  category: 'academic' | 'deadline' | 'social' | 'personal' | 'health' | 'financial' | 'other';
  urgency: 'high' | 'medium' | 'low';
  action_step: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  academic: '📚',
  deadline: '🎤',
  social: '👥',
  personal: '🪫',
  health: '💚',
  financial: '💰',
  other: '📌',
};

function mapDBToBagItem(db: DBBaggageItem): BagItem {
  const isHighUrgency = db.urgency === 'high';
  const isDeadline = db.category === 'deadline';
  const isAcademic = db.category === 'academic';
  const isSocial = db.category === 'social' || db.category === 'financial';

  // Slot assignment based on category/urgency
  let slotKey = 'algo';
  let pocketName = 'Main Pocket';
  if (isDeadline || (isHighUrgency && isAcademic)) {
    slotKey = 'presentation';
    pocketName = 'Top Flap';
  } else if (isAcademic) {
    slotKey = 'algo';
    pocketName = 'Main Pocket';
  } else if (isSocial) {
    slotKey = 'chat';
    pocketName = 'Side Mesh';
  } else {
    slotKey = 'walk';
    pocketName = 'Front Pouch';
  }

  // Badge styling
  let badgeStyle = 'bg-secondary-container text-on-secondary-container font-bold';
  if (isHighUrgency) {
    badgeStyle = 'bg-error-container text-on-error-container font-bold';
  } else if (db.urgency === 'medium') {
    badgeStyle = 'bg-primary-fixed text-on-primary-fixed-variant font-bold';
  }

  // Weight labeling
  let weightLabel = 'Weight: Moderate';
  let weightColorClass = 'text-secondary font-semibold';
  if (isHighUrgency) {
    weightLabel = 'Weight: Heavy';
    weightColorClass = 'text-error font-semibold';
  } else if (db.urgency === 'low') {
    weightLabel = 'Weight: Light';
    weightColorClass = 'text-on-surface-variant';
  }

  const isCompleted = db.status === 'completed';

  return {
    id: db.id,
    unload_id: db.unload_id,
    slotKey,
    titleEmoji: CATEGORY_EMOJI[db.category] ?? '📌',
    title: db.title,
    badgeText: `${db.urgency.toUpperCase()} • ${db.category}`,
    badgeStyle,
    description: db.action_step || 'Packed from mind dump',
    pocketName,
    weightLabel,
    weightColorClass,
    category: `${db.urgency} ${db.category}`,
    actionType: db.action_step ? 'microstep' : 'unpack',
    actionLabel: db.action_step ? 'Micro-steps' : 'Lighten Bag',
    secondaryActionLabel: 'Details',
    completed: isCompleted,
    showMicrosteps: false,
    microsteps: db.action_step
      ? [{ id: `ms-${db.id}`, label: db.action_step, completed: isCompleted }]
      : [],
  };
}

export default function MyBag() {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent' | 'academic' | 'personal'>('all');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  // Add Item Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThoughtTitle, setNewThoughtTitle] = useState('');
  const [selectedPocket, setSelectedPocket] = useState<'Top Flap' | 'Main Bag' | 'Side Mesh' | 'Front Pouch'>('Main Bag');

  // Box Breathing Modal State
  const [isBreatheModalOpen, setIsBreatheModalOpen] = useState(false);
  const [breathePhaseIndex, setBreathePhaseIndex] = useState(0);

  const breathePhases = ['Inhale softly', 'Hold calm', 'Exhale tension', 'Rest in silence'];

  // Fetch baggage items from Supabase
  const fetchBagItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: dbItems, error: fetchError } = await supabase
        .from('baggage_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (dbItems && dbItems.length > 0) {
        setItems(dbItems.map(mapDBToBagItem));
      } else {
        setItems([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch baggage items:', err);
      setError(err.message || 'Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBagItems();
  }, [fetchBagItems]);

  // Handle Box Breathing Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isBreatheModalOpen) {
      interval = setInterval(() => {
        setBreathePhaseIndex((prev) => (prev + 1) % breathePhases.length);
      }, 3000);
    } else {
      setBreathePhaseIndex(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isBreatheModalOpen]);

  // Click handler for Backpack visual slots
  const handleSlotClick = (slotKey: string) => {
    const targetItem = items.find((item) => item.slotKey === slotKey);
    if (targetItem) {
      const el = document.getElementById(targetItem.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedCardId(targetItem.id);
        setTimeout(() => setHighlightedCardId(null), 1200);
      }
    }
  };

  // Toggle item completion in DB & state
  const toggleComplete = async (id: string) => {
    const currentItem = items.find((i) => i.id === id);
    if (!currentItem) return;

    const nextCompleted = !currentItem.completed;
    const nextStatus = nextCompleted ? 'completed' : 'pending';

    // Optimistic UI update
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: nextCompleted } : item))
    );

    // Update in Supabase
    const { error: updateErr } = await supabase
      .from('baggage_items')
      .update({ status: nextStatus })
      .eq('id', id);

    if (updateErr) {
      console.error('Failed to update status in DB:', updateErr);
      // Rollback on error
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, completed: !nextCompleted } : item))
      );
    }
  };

  // Toggle microsteps panel
  const toggleMicrostepPanel = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, showMicrosteps: !item.showMicrosteps } : item
      )
    );
  };

  // Toggle individual microstep check
  const toggleMicrostepCheck = (itemId: string, microstepId: string) => {
    toggleComplete(itemId);
  };

  // Add new item to Supabase & state
  const handleSaveItem = async () => {
    if (!newThoughtTitle.trim()) return;

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !user) throw new Error('Not authenticated');

      const categoryMap: Record<string, { category: 'academic' | 'deadline' | 'social' | 'personal'; urgency: 'high' | 'medium' | 'low' }> = {
        'Top Flap': { category: 'deadline', urgency: 'high' },
        'Main Bag': { category: 'academic', urgency: 'medium' },
        'Side Mesh': { category: 'social', urgency: 'medium' },
        'Front Pouch': { category: 'personal', urgency: 'low' },
      };

      const config = categoryMap[selectedPocket] ?? { category: 'academic', urgency: 'medium' };

      // Get or create an unload_id
      let unloadId: string | null = null;
      const { data: latestUnload } = await supabase
        .from('unloads')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestUnload) {
        unloadId = latestUnload.id;
      } else {
        const { data: newUnload } = await supabase
          .from('unloads')
          .insert({ user_id: user.id, raw_text: newThoughtTitle.trim() })
          .select('id')
          .single();
        if (newUnload) unloadId = newUnload.id;
      }

      if (!unloadId) throw new Error('Could not create unload record');

      const { data: inserted, error: insertErr } = await supabase
        .from('baggage_items')
        .insert({
          unload_id: unloadId,
          user_id: user.id,
          title: newThoughtTitle.trim(),
          category: config.category,
          urgency: config.urgency,
          action_step: 'Packed directly from My Bag',
          status: 'pending',
        })
        .select('*')
        .single();

      if (insertErr) throw insertErr;

      if (inserted) {
        setItems((prev) => [mapDBToBagItem(inserted), ...prev]);
      }

      setNewThoughtTitle('');
      setIsAddModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save item:', err);
      alert(err.message || 'Failed to add item to bag');
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true;
    return item.category.includes(activeFilter);
  });

  const activeCount = items.filter((i) => !i.completed).length;
  const totalCount = items.length;
  const capacityPercent = totalCount > 0 ? Math.min(Math.round((activeCount / totalCount) * 100), 100) : 0;

  // Compute ring styling for Box Breathing
  const ringScaleClass =
    breathePhaseIndex === 0
      ? 'w-32 h-32 rounded-full bg-primary/40 transition-all duration-1000 flex items-center justify-center scale-110'
      : breathePhaseIndex === 2
      ? 'w-20 h-20 rounded-full bg-secondary-container transition-all duration-1000 flex items-center justify-center scale-90'
      : 'w-24 h-24 rounded-full bg-primary-fixed/60 transition-all duration-1000 flex items-center justify-center scale-100';

  return (
    <div className="w-full">
      <section className="max-w-[1180px] mx-auto w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        {/* Top Banner Card */}
        <div className="relative bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-sm overflow-hidden mb-space-lg">
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -bottom-10 w-44 h-44 rounded-full bg-secondary-container/30 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="space-y-space-xs max-w-2xl">
              <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-1 rounded-full shadow-sm">
                <span className="text-sm leading-none">🎒</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Current Capacity: {capacityPercent}% full
                </span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  {capacityPercent < 70 ? 'Feeling manageable' : 'Heavy load'}
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                Your Bag
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Here is what you're holding today. Click any item in the backpack or list to inspect,
                unpack, or mark completed.
              </p>
            </div>

            <div className="flex items-center gap-space-sm self-start md:self-center">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>Pack New Thought</span>
              </button>
              <button
                onClick={() => setIsBreatheModalOpen(true)}
                className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">air</span>
                <span className="hidden sm:inline">2-Min Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading & Error States */}
        {isLoading && (
          <div className="py-space-xl">
            <LoadingState message="Loading your bag..." />
          </div>
        )}

        {error && (
          <div className="mb-space-lg p-space-md rounded-xl bg-error-container text-on-error-container flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-2xl">error</span>
              <p className="text-body-md">{error}</p>
            </div>
            <button
              onClick={fetchBagItems}
              className="px-space-md py-space-xs bg-error text-on-error rounded-full text-label-md font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && items.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm mb-space-xl text-center">
            <EmptyState
              title="Your bag is empty 🎒"
              message="No thoughts or tasks packed yet. Go to Unpack to dump what's on your mind!"
            />
            <div className="mt-space-md">
              <Link
                to="/unpack"
                className="inline-flex items-center gap-space-xs px-space-xl py-space-md rounded-full bg-primary text-on-primary font-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] transition-all cursor-pointer"
              >
                <span>Start Unpacking</span>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </Link>
            </div>
          </div>
        )}

        {/* Main Grid */}
        {!isLoading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-gutter-desktop items-start">
            {/* Left Column: Backpack Graphic & Pax Companion */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {/* Backpack Volume Meter */}
              <div className="relative bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <div className="flex items-center justify-between pb-space-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      Backpack Volume
                    </span>
                    <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded-full font-bold">
                    {activeCount} / {totalCount} Items
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3.5 p-0.5 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-500 relative"
                    style={{ width: `${capacityPercent}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-1">
                  <span>Room for quietness</span>
                  <span className="text-secondary font-semibold">
                    {capacityPercent < 50 ? 'Light load today' : 'Manageable load'}
                  </span>
                </div>
              </div>

              {/* Visual Backpack & Pax Companion */}
              <div className="relative bg-surface-container-low rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col items-center">
                {/* Pax Speech Bubble */}
                <div className="w-full mb-space-sm relative">
                  <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-start gap-space-sm relative">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-[22px]">pets</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-primary font-bold tracking-wide uppercase">
                          Pax Companion
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Just now
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface mt-0.5 font-medium">
                        "You have{' '}
                        <span className="font-bold text-secondary">{activeCount} item{activeCount > 1 ? 's' : ''}</span> in
                        your bag today! Take it one step at a time."
                      </p>
                    </div>
                    <div className="absolute -bottom-2 left-6 w-3 h-3 bg-surface-container-lowest rotate-45"></div>
                  </div>
                </div>

                {/* Interactive Visual Backpack Container */}
                <div className="relative w-full max-w-[340px] aspect-[4/5] bg-surface-container rounded-3xl p-space-md flex flex-col justify-between shadow-inner overflow-hidden">
                  <div className="absolute inset-x-8 top-3 h-10 rounded-t-full bg-surface-dim opacity-70"></div>
                  <div className="absolute inset-x-12 top-2 h-7 rounded-t-full bg-surface-container-high opacity-90"></div>

                  <div className="relative z-10 flex justify-between items-center px-space-xs pt-1">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-[12px] shadow-sm font-bold text-on-secondary-container">
                        #{items.length}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-[12px] shadow-sm font-bold text-on-tertiary-fixed">
                        ★
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span> Canvas
                      Pro 24L
                    </div>
                  </div>

                  {/* Pocket Slots */}
                  <div className="relative z-10 flex flex-col gap-2.5 my-auto w-full">
                    {/* Top Flap Slot */}
                    <div
                      onClick={() => handleSlotClick('presentation')}
                      className="group cursor-pointer bg-surface-container-lowest hover:bg-primary-fixed/20 p-space-sm rounded-lg shadow-sm transition-all hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span className="text-base">🎤</span>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                              Top Flap Pouch
                            </span>
                            <span className="font-label-md text-label-md text-on-surface font-bold leading-tight truncate max-w-[170px]">
                              {items.find((i) => i.slotKey === 'presentation')?.title || 'Immediate Tasks'}
                            </span>
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                      </div>
                    </div>

                    {/* Main Deep Pocket Slot */}
                    <div
                      onClick={() => handleSlotClick('algo')}
                      className="group cursor-pointer bg-surface-container-lowest hover:bg-primary-fixed/20 p-space-md rounded-xl shadow-sm transition-all hover:scale-[1.02] relative"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-space-xs">
                          <span className="text-xl">📚</span>
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-primary font-bold">
                              Main Deep Pocket
                            </span>
                            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight truncate max-w-[180px]">
                              {items.find((i) => i.slotKey === 'algo')?.title || 'Academic Tasks'}
                            </span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              Main mental load
                            </span>
                          </div>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          High
                        </span>
                      </div>
                    </div>

                    {/* Grid Slots */}
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        onClick={() => handleSlotClick('chat')}
                        className="group cursor-pointer bg-surface-container-lowest hover:bg-primary-fixed/20 p-space-xs rounded-lg shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">👥</span>
                          <div className="flex flex-col truncate">
                            <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                              Side Mesh
                            </span>
                            <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                              {items.find((i) => i.slotKey === 'chat')?.title || 'Social & Messages'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        onClick={() => handleSlotClick('walk')}
                        className="group cursor-pointer bg-surface-container-lowest hover:bg-secondary-container/30 p-space-xs rounded-lg shadow-sm transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🪫</span>
                          <div className="flex flex-col truncate">
                            <span className="font-label-sm text-label-sm text-secondary truncate">
                              Front Pouch
                            </span>
                            <span className="font-label-md text-label-md text-on-surface truncate font-semibold">
                              {items.find((i) => i.slotKey === 'walk')?.title || 'Self-Care'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keychain Footer */}
                  <div className="relative z-10 w-full bg-surface-dim/40 rounded-lg p-space-xs flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Keychain: Pax Felt Charm
                    </span>
                    <span className="material-symbols-outlined text-primary text-[18px]">key</span>
                  </div>
                </div>

                <div className="flex items-center gap-space-xs mt-space-sm text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">touch_app</span>
                  <span>Tap any pocket above to highlight its details below</span>
                </div>
              </div>
            </div>

            {/* Right Column: Filter Tabs & Bag Item Cards */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Navigation / Filters */}
              <div className="flex flex-wrap items-center justify-between gap-space-xs pb-1">
                <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full shadow-inner overflow-x-auto max-w-full">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      activeFilter === 'all'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    All ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('urgent')}
                    className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      activeFilter === 'urgent'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Urgent ({items.filter((i) => i.category.includes('high') || i.category.includes('urgent')).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('academic')}
                    className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      activeFilter === 'academic'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Academic ({items.filter((i) => i.category.includes('academic')).length})
                  </button>
                  <button
                    onClick={() => setActiveFilter('personal')}
                    className={`px-space-md py-1 rounded-full font-label-md text-label-md transition-all cursor-pointer ${
                      activeFilter === 'personal'
                        ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Personal ({items.filter((i) => i.category.includes('personal') || i.category.includes('social')).length})
                  </button>
                </div>

                <button
                  onClick={fetchBagItems}
                  className="flex items-center gap-1 font-label-md text-label-md text-primary hover:underline px-2 py-1 cursor-pointer"
                  title="Refresh items from database"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>Refresh</span>
                </button>
              </div>

              {/* Bag Cards List */}
              <div className="flex flex-col gap-space-sm" id="bagItemsList">
                {filteredItems.map((item) => {
                  const isHighlighted = highlightedCardId === item.id;

                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className={`bag-card bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all ${
                        item.completed ? 'opacity-50' : ''
                      } ${isHighlighted ? 'bg-primary-fixed/20 ring-2 ring-primary/40' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-space-sm">
                          {/* Custom Checkbox Button */}
                          <button
                            onClick={() => toggleComplete(item.id)}
                            className={`mt-1 w-6 h-6 rounded-lg border border-transparent flex items-center justify-center transition-all cursor-pointer ${
                              item.completed
                                ? 'bg-secondary text-on-secondary'
                                : 'bg-surface-container hover:bg-secondary-container text-transparent'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">check</span>
                          </button>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`font-headline-sm text-headline-sm text-on-surface ${
                                  item.completed ? 'line-through text-outline' : ''
                                }`}
                              >
                                {item.titleEmoji} {item.title}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm ${item.badgeStyle}`}>
                                {item.badgeText}
                              </span>
                            </div>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-space-xs pt-1">
                              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">backpack</span>
                                {item.pocketName}
                              </span>
                              <span className="text-on-surface-variant text-xs">•</span>
                              <span className={`font-label-sm text-label-sm ${item.weightColorClass}`}>
                                {item.weightLabel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                          {item.actionType === 'unpack' && (
                            <button
                              onClick={() => toggleComplete(item.id)}
                              className="w-full sm:w-auto px-space-md py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_2px_0_#5516be] hover:translate-y-[1px] transition-all cursor-pointer"
                            >
                              {item.completed ? 'Mark Pending' : item.actionLabel}
                            </button>
                          )}
                          {item.actionType === 'microstep' && (
                            <button
                              onClick={() => toggleMicrostepPanel(item.id)}
                              className="w-full sm:w-auto px-space-md py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm cursor-pointer"
                            >
                              {item.actionLabel}
                            </button>
                          )}
                          {item.actionType === 'snooze' && (
                            <button
                              onClick={() => toggleComplete(item.id)}
                              className="w-full sm:w-auto px-space-md py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm cursor-pointer"
                            >
                              {item.actionLabel}
                            </button>
                          )}
                          {item.actionType === 'walk' && (
                            <button
                              onClick={() => toggleComplete(item.id)}
                              className="w-full sm:w-auto px-space-md py-1.5 rounded-full bg-secondary text-on-secondary font-label-md text-label-md shadow-sm hover:opacity-90 transition-all cursor-pointer"
                            >
                              {item.actionLabel}
                            </button>
                          )}

                          {item.secondaryActionLabel && (
                            <button
                              onClick={() => toggleComplete(item.id)}
                              className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm px-2 py-1 cursor-pointer"
                            >
                              {item.completed ? 'Reopen' : item.secondaryActionLabel}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Collapsible Microsteps Panel */}
                      {item.microsteps && item.showMicrosteps && (
                        <div className="mt-space-md pt-space-sm bg-surface-container-low p-space-sm rounded-lg">
                          <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
                            Micro-Decompression
                          </span>
                          <div className="space-y-1 mt-1">
                            {item.microsteps.map((ms) => (
                              <label
                                key={ms.id}
                                className="flex items-center gap-2 text-sm text-on-surface cursor-pointer select-none"
                              >
                                <input
                                  type="checkbox"
                                  checked={ms.completed}
                                  onChange={() => toggleMicrostepCheck(item.id, ms.id)}
                                  className="rounded accent-primary cursor-pointer"
                                />
                                <span className={ms.completed ? 'line-through text-on-surface-variant' : ''}>
                                  {ms.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bag Insight Footer */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between shadow-sm mt-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed font-bold text-sm">
                    ✨
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">Bag Insight</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      You have {totalCount - activeCount} completed items and {activeCount} active items in your bag.
                    </p>
                  </div>
                </div>
                <Link to="/progress" className="font-label-md text-label-md text-primary font-bold hover:underline shrink-0">
                  View stats
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pack New Thought Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-margin">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="text-2xl">🎒</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                Pack a Thought or Task
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Give the thing occupying your head a cozy pocket so you don't have to carry it alone.
            </p>
            <div className="space-y-space-md">
              <div>
                <label className="font-label-md text-label-md text-on-surface font-bold block mb-1">
                  What are you carrying?
                </label>
                <input
                  type="text"
                  value={newThoughtTitle}
                  onChange={(e) => setNewThoughtTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveItem()}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Lab report methodology revision"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface font-bold block mb-1">
                  Which pocket does it belong in?
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {(['Top Flap', 'Main Bag', 'Side Mesh', 'Front Pouch'] as const).map((pocket) => (
                    <button
                      key={pocket}
                      type="button"
                      onClick={() => setSelectedPocket(pocket)}
                      className={`p-2 text-left rounded-lg font-medium transition-colors cursor-pointer ${
                        selectedPocket === pocket
                          ? 'bg-primary-container text-on-primary-container font-bold'
                          : 'bg-surface-container hover:bg-primary-fixed/20 text-on-surface'
                      }`}
                    >
                      {pocket === 'Top Flap' && 'Top Flap (Immediate)'}
                      {pocket === 'Main Bag' && 'Main Bag (Heavy/Academic)'}
                      {pocket === 'Side Mesh' && 'Side Mesh (People/Messages)'}
                      {pocket === 'Front Pouch' && 'Front Pouch (Self-Care)'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-space-md py-space-sm rounded-full text-on-surface-variant font-label-md hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Put in Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Min Box Breathing Modal */}
      {isBreatheModalOpen && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/50 backdrop-blur-md flex items-center justify-center p-margin">
          <div className="bg-surface-container-lowest rounded-2xl max-w-sm w-full p-space-xl text-center shadow-2xl relative flex flex-col items-center">
            <button
              onClick={() => setIsBreatheModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-widest mb-space-xs">
              Box Breathing
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-space-md">
              {breathePhases[breathePhaseIndex]}
            </h3>
            <div className="relative w-36 h-36 flex items-center justify-center my-space-md">
              <div className={ringScaleClass}>
                <span className="material-symbols-outlined text-primary text-3xl">air</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              Let your shoulders settle down from your ears.
            </p>
            <button
              onClick={() => setIsBreatheModalOpen(false)}
              className="mt-space-lg px-space-lg py-space-sm rounded-full bg-surface-container font-label-md text-on-surface hover:bg-surface-container-high transition-all cursor-pointer"
            >
              Done for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
