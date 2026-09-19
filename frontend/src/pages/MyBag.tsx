import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────
type Urgency = 'high' | 'medium' | 'low';
type Status = 'pending' | 'in_progress' | 'completed';
type Category = 'academic' | 'deadline' | 'social' | 'personal' | 'health' | 'financial' | 'other';
type FilterId = 'all' | 'urgent' | 'academic' | 'personal' | 'archive';
type PocketName = 'Top Flap' | 'Main Pocket' | 'Side Mesh' | 'Front Pouch';
type SlotKey = 'presentation' | 'algo' | 'chat' | 'walk';

interface DBBaggageItem {
  id: string;
  unload_id: string;
  user_id: string;
  title: string;
  category: Category;
  urgency: Urgency;
  action_step: string | null;
  status: Status;
  created_at: string;
}

interface Toast {
  message: string;
  undoId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGO_SRC = '/unpack-logo.png';

const CATEGORY_EMOJI: Record<string, string> = {
  academic: '📚',
  deadline: '🎤',
  social: '👥',
  personal: '🪫',
  health: '💚',
  financial: '💰',
  other: '📌',
};

// Teks bawaan yang bukan langkah sungguhan
const PLACEHOLDER_STEPS = ['Packed directly from My Bag', 'Packed from mind dump'];

const URGENCY_RANK: Record<Urgency, number> = { high: 3, medium: 2, low: 1 };

const URGENCY_STYLE: Record<Urgency, { label: string; cls: string }> = {
  high:   { label: 'Urgent', cls: 'bg-error-container text-on-error-container' },
  medium: { label: 'Medium', cls: 'bg-primary-fixed text-on-primary-fixed-variant' },
  low:    { label: 'Light',  cls: 'bg-secondary-container text-on-secondary-container' },
};

// Beban tas: item urgent dihitung lebih berat. 15 poin = tas penuh.
const CAPACITY_POINTS = 15;

const SLOTS: { key: SlotKey; pocket: PocketName; emoji: string; label: string; fallback: string }[] = [
  { key: 'presentation', pocket: 'Top Flap',    emoji: '🎤', label: 'Top Flap',    fallback: 'Immediate tasks' },
  { key: 'algo',         pocket: 'Main Pocket', emoji: '📚', label: 'Main Pocket', fallback: 'Academic tasks' },
  { key: 'chat',         pocket: 'Side Mesh',   emoji: '👥', label: 'Side Mesh',   fallback: 'People & messages' },
  { key: 'walk',         pocket: 'Front Pouch', emoji: '🪫', label: 'Front Pouch', fallback: 'Self-care' },
];

const POCKET_OPTIONS: { pocket: PocketName; hint: string }[] = [
  { pocket: 'Top Flap',    hint: 'Immediate' },
  { pocket: 'Main Pocket', hint: 'Heavy / academic' },
  { pocket: 'Side Mesh',   hint: 'People / messages' },
  { pocket: 'Front Pouch', hint: 'Self-care' },
];

const POCKET_CONFIG: Record<PocketName, { category: Category; urgency: Urgency }> = {
  'Top Flap':    { category: 'deadline', urgency: 'high' },
  'Main Pocket': { category: 'academic', urgency: 'medium' },
  'Side Mesh':   { category: 'social',   urgency: 'medium' },
  'Front Pouch': { category: 'personal', urgency: 'low' },
};

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'urgent',   label: 'Urgent' },
  { id: 'academic', label: 'Academic' },
  { id: 'personal', label: 'Personal' },
];

// Archive tidak ada di tab, tapi tetap dihitung untuk tombol "Unpacked History".
const ALL_FILTER_IDS: FilterId[] = ['all', 'urgent', 'academic', 'personal', 'archive'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slotFor(item: DBBaggageItem): SlotKey {
  if (item.category === 'deadline' || (item.urgency === 'high' && item.category === 'academic')) return 'presentation';
  if (item.category === 'academic') return 'algo';
  if (item.category === 'social' || item.category === 'financial') return 'chat';
  return 'walk';
}

function realStep(item: DBBaggageItem): string | null {
  const step = item.action_step?.trim();
  return step && !PLACEHOLDER_STEPS.includes(step) ? step : null;
}

/** Sama dengan logika di Unwind, jadi teks langkahnya konsisten di kedua halaman. */
function getMicroStep(item: DBBaggageItem): { text: string; duration: number } {
  const step = realStep(item);
  if (step) return { text: step, duration: 10 };
  if (item.category === 'academic')  return { text: 'Open the file and identify the easiest part to start with.', duration: 10 };
  if (item.category === 'deadline')  return { text: 'Write down the one thing you must remember for this deadline.', duration: 5 };
  if (item.category === 'social')    return { text: 'Send one short message to check in with whoever is involved.', duration: 5 };
  if (item.category === 'health')    return { text: 'Do one small thing for your body: water, stretch, or a short walk.', duration: 5 };
  if (item.category === 'financial') return { text: 'Open your banking app and just look at the number. No decisions yet.', duration: 5 };
  return { text: 'Write down three things you remember about this task.', duration: 10 };
}

const isArchived = (item: DBBaggageItem) => item.status === 'completed';
const isAcademicGroup = (item: DBBaggageItem) => item.category === 'academic' || item.category === 'deadline';

/** Satu sumber kebenaran untuk filter DAN angka di tab, jadi keduanya selalu sama. */
function matchesFilter(item: DBBaggageItem, filter: FilterId): boolean {
  if (filter === 'archive') return isArchived(item);
  if (isArchived(item)) return false;
  switch (filter) {
    case 'urgent':   return item.urgency === 'high';
    case 'academic': return isAcademicGroup(item);
    case 'personal': return !isAcademicGroup(item);
    default:         return true;
  }
}

// ─── Small components ─────────────────────────────────────────────────────────
function PocketSlot({
  slot,
  items,
  onClick,
  large = false,
}: {
  slot: (typeof SLOTS)[number];
  items: DBBaggageItem[];
  onClick: () => void;
  large?: boolean;
}) {
  const first = items[0];
  const extra = items.length - 1;
  const empty = items.length === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={empty}
      className={`group w-full text-left bg-surface-container-lowest rounded-xl shadow-sm transition-all enabled:cursor-pointer enabled:hover:bg-primary-fixed/20 enabled:hover:scale-[1.02] disabled:opacity-60 ${
        large ? 'p-space-md' : 'p-space-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-space-xs min-w-0">
          <span className={large ? 'text-xl' : 'text-base'}>{slot.emoji}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant">{slot.label}</span>
            <span
              className={`text-on-surface truncate ${
                large ? 'font-headline-sm text-headline-sm' : 'font-label-md text-label-md font-semibold'
              }`}
            >
              {first ? first.title : slot.fallback}
            </span>
          </div>
        </div>
        {!empty && (
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm font-bold">
            {extra > 0 ? `+${extra}` : items.length}
          </span>
        )}
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MyBag() {
  const [items, setItems] = useState<DBBaggageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThoughtTitle, setNewThoughtTitle] = useState('');
  const [selectedPocket, setSelectedPocket] = useState<PocketName>('Main Pocket');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─── Data ───────────────────────────────────────────────────────────────────
  const fetchBagItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('baggage_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setItems((data ?? []) as DBBaggageItem[]);
    } catch (err: any) {
      console.error('Failed to fetch baggage items:', err);
      setError(err?.message || 'Failed to load items.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBagItems();
  }, [fetchBagItems]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (next: Toast) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  // Ubah status dengan update optimistis + rollback kalau gagal.
  const changeStatus = async (id: string, next: Status) => {
    const current = items.find(i => i.id === id);
    if (!current) return;
    const previous = current.status;

    setItems(list => list.map(i => (i.id === id ? { ...i, status: next } : i)));

    const { error: updateErr } = await supabase.from('baggage_items').update({ status: next }).eq('id', id);

    if (updateErr) {
      console.error('Failed to update status in DB:', updateErr);
      setItems(list => list.map(i => (i.id === id ? { ...i, status: previous } : i)));
      showToast({ message: "Couldn't update that item. Try again." });
    }
  };

  const archiveItem = (id: string) => {
    void changeStatus(id, 'completed');
    showToast({ message: 'Moved to Unpacked History', undoId: id });
  };

  const restoreItem = (id: string) => {
    void changeStatus(id, 'pending');
  };

  const undoArchive = () => {
    if (!toast?.undoId) return;
    void changeStatus(toast.undoId, 'pending');
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  };

  // ─── Add item ───────────────────────────────────────────────────────────────
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSaveError(null);
  };

  const handleSaveItem = async () => {
    const title = newThoughtTitle.trim();
    if (!title || isSaving) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !user) throw new Error('Not authenticated');

      const config = POCKET_CONFIG[selectedPocket];

      // Ambil unload terbaru milik user, atau buat baru
      let unloadId: string | null = null;
      const { data: latestUnload } = await supabase
        .from('unloads')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestUnload) {
        unloadId = latestUnload.id;
      } else {
        const { data: newUnload } = await supabase
          .from('unloads')
          .insert({ user_id: user.id, raw_text: title })
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
          title,
          category: config.category,
          urgency: config.urgency,
          action_step: null, // tidak ada langkah palsu; Unwind akan membuat saran sendiri
          status: 'pending',
        })
        .select('*')
        .single();

      if (insertErr) throw insertErr;

      if (inserted) setItems(prev => [inserted as DBBaggageItem, ...prev]);

      setNewThoughtTitle('');
      setActiveFilter('all');
      closeAddModal();
    } catch (err: any) {
      console.error('Failed to save item:', err);
      setSaveError(err?.message || 'Failed to add item to bag');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Derived ────────────────────────────────────────────────────────────────
  // Urgent dulu; di antara urgensi yang sama, urutan terbaru (dari query) tetap terjaga.
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]),
    [items]
  );

  const activeItems = useMemo(() => sortedItems.filter(i => !isArchived(i)), [sortedItems]);

  const counts = useMemo(() => {
    const result = {} as Record<FilterId, number>;
    ALL_FILTER_IDS.forEach(id => {
      result[id] = items.filter(i => matchesFilter(i, id)).length;
    });
    return result;
  }, [items]);

  const visibleItems = useMemo(
    () => sortedItems.filter(i => matchesFilter(i, activeFilter)),
    [sortedItems, activeFilter]
  );

  const itemsBySlot = useMemo(() => {
    const map: Record<SlotKey, DBBaggageItem[]> = { presentation: [], algo: [], chat: [], walk: [] };
    activeItems.forEach(i => map[slotFor(i)].push(i));
    return map;
  }, [activeItems]);

  const activeCount = activeItems.length;
  const archiveCount = counts.archive;
  const load = activeItems.reduce((sum, i) => sum + URGENCY_RANK[i.urgency], 0);
  const capacityPercent = Math.min(100, Math.round((load / CAPACITY_POINTS) * 100));
  const loadLabel = capacityPercent < 35 ? 'Light load' : capacityPercent < 70 ? 'Manageable' : 'Heavy load';

  // Klik pocket di tas: pindah ke tab All, lalu scroll ke kartu item pertama di pocket itu.
  const handleSlotClick = (slotKey: SlotKey) => {
    const target = itemsBySlot[slotKey][0];
    if (!target) return;
    setActiveFilter('all');
    setTimeout(() => {
      const el = document.getElementById(`bag-item-${target.id}`);
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedCardId(target.id);
      setTimeout(() => setHighlightedCardId(null), 1200);
    }, 60);
  };

  const emptyMessage: Record<FilterId, string> = {
    all: 'Nothing active in your bag. Enjoy the quiet.',
    urgent: 'No urgent items right now.',
    academic: 'No academic items right now.',
    personal: 'No personal items right now.',
    archive: 'Nothing unpacked yet. Check off an item and it will show up here.',
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      <section className="max-w-[1180px] mx-auto w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        {/* Top Banner */}
        <div className="relative bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-sm overflow-hidden mb-space-lg">
          <div className="absolute -right-6 -top-6 w-36 h-36 rounded-full bg-primary-fixed/40 blur-2xl pointer-events-none"></div>
          <div className="absolute right-32 -bottom-10 w-44 h-44 rounded-full bg-secondary-container/30 blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="space-y-space-xs max-w-2xl">
              <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-1 rounded-full shadow-sm">
                <span className="text-sm leading-none">🎒</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  Current capacity: {capacityPercent}% full
                </span>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-bold">
                  {loadLabel}
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Your Bag</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Here is what you're holding today. Check an item off and it moves to Unpacked History.
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
              <Link
                to="/unwind#quick-resets-section"
                className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">spa</span>
                <span className="hidden sm:inline">Quick Reset</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading & Error */}
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
            {/* ── Left column ── */}
            <div className="lg:col-span-5 flex flex-col gap-space-md lg:sticky lg:top-24">
              {/* Volume meter */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
                <div className="flex items-center justify-between pb-space-sm">
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">Backpack volume</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-space-xs py-0.5 rounded-full font-bold">
                    {activeCount} active
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-3.5 p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-primary-container h-full rounded-full transition-all duration-500"
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm mt-1">
                  <span>Room for quietness</span>
                  <span className="text-secondary font-semibold">{loadLabel}</span>
                </div>
              </div>

              {/* Pax + backpack */}
              <div className="bg-surface-container-low rounded-xl p-space-md lg:p-space-lg shadow-sm flex flex-col gap-space-md">
                {/* Pax bubble */}
                <div className="bg-surface-container-lowest p-space-sm rounded-xl shadow-sm flex items-center gap-space-sm">
                  <img
                    src={LOGO_SRC}
                    alt="Unpack"
                    className="w-10 h-10 shrink-0 object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-label-sm text-label-sm text-primary font-bold tracking-wide">Pax</span>
                    <p className="font-body-sm text-body-sm text-on-surface font-medium">
                      {activeCount === 0 ? (
                        "Your bag is clear. Enjoy the quiet."
                      ) : (
                        <>
                          You have{' '}
                          <span className="font-bold text-secondary">
                            {activeCount} item{activeCount === 1 ? '' : 's'}
                          </span>{' '}
                          today. One step at a time.
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Backpack */}
                <div className="w-full max-w-[340px] mx-auto bg-surface-container rounded-3xl p-space-md shadow-inner relative overflow-hidden">
                  <div className="absolute inset-x-8 top-3 h-10 rounded-t-full bg-surface-dim opacity-70"></div>
                  <div className="absolute inset-x-12 top-2 h-7 rounded-t-full bg-surface-container-high opacity-90"></div>

                  <div className="relative z-10 flex flex-col gap-2.5 pt-8">
                    <PocketSlot slot={SLOTS[0]!} items={itemsBySlot.presentation} onClick={() => handleSlotClick('presentation')} />
                    <PocketSlot slot={SLOTS[1]!} items={itemsBySlot.algo} onClick={() => handleSlotClick('algo')} large />
                    <div className="grid grid-cols-2 gap-2.5">
                      <PocketSlot slot={SLOTS[2]!} items={itemsBySlot.chat} onClick={() => handleSlotClick('chat')} />
                      <PocketSlot slot={SLOTS[3]!} items={itemsBySlot.walk} onClick={() => handleSlotClick('walk')} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[16px]">touch_app</span>
                  <span>Tap a pocket to jump to its items</span>
                </div>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-space-xs">
                <div
                  role="tablist"
                  className="flex items-center gap-1 bg-surface-container p-1 rounded-full shadow-inner overflow-x-auto max-w-full"
                >
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      role="tab"
                      aria-selected={activeFilter === f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-space-md py-1 rounded-full font-label-md text-label-md whitespace-nowrap transition-all cursor-pointer ${
                        activeFilter === f.id
                          ? 'bg-surface-container-lowest text-on-surface shadow-sm font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {f.label} ({counts[f.id]})
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveFilter(activeFilter === 'archive' ? 'all' : 'archive')}
                  className={`flex items-center gap-1 font-label-md text-label-md px-3 py-1 rounded-full cursor-pointer transition-all ${
                    activeFilter === 'archive'
                      ? 'bg-surface-container text-on-surface font-bold'
                      : 'text-primary hover:underline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {activeFilter === 'archive' ? 'arrow_back' : 'inventory_2'}
                  </span>
                  <span>{activeFilter === 'archive' ? 'Back to bag' : `Unpacked History (${counts.archive})`}</span>
                </button>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-space-sm" id="bagItemsList">
                {visibleItems.length === 0 && (
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm text-center">
                    <p className="font-body-md text-body-md text-on-surface-variant">{emptyMessage[activeFilter]}</p>
                  </div>
                )}

                {visibleItems.map(item => {
                  const archived = isArchived(item);
                  const micro = getMicroStep(item);
                  const urgency = URGENCY_STYLE[item.urgency];
                  const pocket = SLOTS.find(s => s.key === slotFor(item))!;

                  return (
                    <article
                      key={item.id}
                      id={`bag-item-${item.id}`}
                      className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm transition-all ${
                        archived ? 'opacity-70' : ''
                      } ${highlightedCardId === item.id ? 'bg-primary-fixed/20 ring-2 ring-primary/40' : ''}`}
                    >
                      <div className="flex items-start gap-space-sm">
                        {/* Checkbox: centang = masuk arsip, klik lagi di arsip = kembalikan */}
                        <button
                          onClick={() => (archived ? restoreItem(item.id) : archiveItem(item.id))}
                          aria-label={archived ? 'Move back to bag' : 'Check off'}
                          title={archived ? 'Move back to bag' : 'Check off and unpack'}
                          className={`mt-0.5 w-6 h-6 shrink-0 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                            archived
                              ? 'bg-secondary text-on-secondary'
                              : 'bg-surface-container hover:bg-secondary-container text-transparent hover:text-on-secondary-container'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">check</span>
                        </button>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={`font-headline-sm text-headline-sm text-on-surface break-words ${
                              archived ? 'line-through text-outline' : ''
                            }`}
                          >
                            {CATEGORY_EMOJI[item.category] ?? '📌'} {item.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold ${urgency.cls}`}>
                              {urgency.label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm capitalize">
                              {item.category}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                              <span className="material-symbols-outlined text-[14px]">backpack</span>
                              {pocket.pocket}
                            </span>
                            {item.status === 'in_progress' && (
                              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-bold">
                                In progress
                              </span>
                            )}
                          </div>

                          <div className="mt-space-sm bg-surface-container-low px-space-sm py-2 rounded-lg">
                            <p className="font-label-sm text-label-sm text-primary font-bold">
                              Next tiny step · ~{micro.duration} min
                            </p>
                            <p className="font-body-md text-body-md text-on-surface mt-0.5">{micro.text}</p>
                            {!archived && (
                              <Link
                                to="/unwind#small-action-section"
                                className="inline-flex items-center gap-1 mt-1.5 font-label-md text-label-md text-primary hover:underline"
                              >
                                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                Start it in Unwind
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        {archived && (
                          <div className="shrink-0">
                            <button
                              onClick={() => restoreItem(item.id)}
                              className="px-space-md py-1.5 rounded-full bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all cursor-pointer"
                            >
                              Restore
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Insight footer */}
              <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm shadow-sm">
                <div className="w-8 h-8 rounded-full bg-tertiary-fixed flex items-center justify-center text-sm">✨</div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface font-semibold">Bag insight</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {activeCount} active and {archiveCount} unpacked {archiveCount === 1 ? 'item' : 'items'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Undo toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-space-md py-space-sm rounded-full bg-inverse-surface text-inverse-on-surface shadow-lg"
        >
          <span className="font-label-md text-label-md">{toast.message}</span>
          {toast.undoId && (
            <button
              onClick={undoArchive}
              className="font-label-md text-label-md font-bold text-inverse-primary hover:underline cursor-pointer"
            >
              Undo
            </button>
          )}
        </div>
      )}

      {/* Pack New Thought Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-margin"
          onClick={e => {
            if (e.target === e.currentTarget) closeAddModal();
          }}
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-lg shadow-2xl relative">
            <button
              onClick={closeAddModal}
              aria-label="Close"
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex items-center gap-space-xs mb-space-sm">
              <span className="text-2xl">🎒</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Pack a thought or task</h3>
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
                  autoFocus
                  value={newThoughtTitle}
                  onChange={e => setNewThoughtTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveItem()}
                  className="w-full bg-surface-container-low px-space-md py-space-sm rounded-lg text-body-md focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                  placeholder="e.g. Lab report methodology revision"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface font-bold block mb-1">
                  Which pocket does it belong in?
                </label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {POCKET_OPTIONS.map(({ pocket, hint }) => (
                    <button
                      key={pocket}
                      type="button"
                      onClick={() => setSelectedPocket(pocket)}
                      className={`p-2 text-left rounded-lg transition-colors cursor-pointer ${
                        selectedPocket === pocket
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container hover:bg-primary-fixed/20 text-on-surface'
                      }`}
                    >
                      <span className="block font-bold">{pocket}</span>
                      <span className="block text-[12px] opacity-80">{hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {saveError && <p className="font-label-md text-label-md text-error">{saveError}</p>}

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  onClick={closeAddModal}
                  className="px-space-md py-space-sm rounded-full text-on-surface-variant font-label-md hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={!newThoughtTitle.trim() || isSaving}
                  className="px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg shadow-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Packing...' : 'Put in bag'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}