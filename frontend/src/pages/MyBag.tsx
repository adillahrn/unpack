import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import LoadingState from '@/components/states/LoadingState';
import EmptyState from '@/components/states/EmptyState';
import { useTranslation } from '@/i18n';

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
  duration_minutes?: number | null;
  status: Status;
  created_at: string;
}

interface Toast {
  message: string;
  undoId?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const LOGO_SRC = '/unpack_logo.png';

const CATEGORY_EMOJI: Record<string, string> = {
  academic: '📚',
  deadline: '🎤',
  social: '👥',
  personal: '🪫',
  health: '💚',
  financial: '💰',
  other: '📌',
};

const PLACEHOLDER_STEPS = ['Packed directly from My Bag', 'Packed from mind dump'];
const URGENCY_RANK: Record<Urgency, number> = { high: 3, medium: 2, low: 1 };

const CAPACITY_POINTS = 15;

const SLOTS: { key: SlotKey; pocket: PocketName; emoji: string; labelKey: string; fallback: string }[] = [
  { key: 'presentation', pocket: 'Top Flap', emoji: '🎤', labelKey: 'mybag.topFlap', fallback: 'Top Flap (Immediate)' },
  { key: 'algo', pocket: 'Main Pocket', emoji: '📚', labelKey: 'mybag.mainPocket', fallback: 'Main Pocket (Academic)' },
  { key: 'chat', pocket: 'Side Mesh', emoji: '👥', labelKey: 'mybag.sideMesh', fallback: 'Side Mesh (Social/Messages)' },
  { key: 'walk', pocket: 'Front Pouch', emoji: '🪫', labelKey: 'mybag.frontPouch', fallback: 'Front Pouch (Self-Care)' },
];

const POCKET_CONFIG: Record<PocketName, { category: Category; urgency: Urgency }> = {
  'Top Flap': { category: 'deadline', urgency: 'high' },
  'Main Pocket': { category: 'academic', urgency: 'medium' },
  'Side Mesh': { category: 'social', urgency: 'medium' },
  'Front Pouch': { category: 'personal', urgency: 'low' },
};

const ALL_FILTER_IDS: FilterId[] = ['all', 'urgent', 'academic', 'personal', 'archive'];

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

const isArchived = (item: DBBaggageItem) => item.status === 'completed';
const isAcademicGroup = (item: DBBaggageItem) => item.category === 'academic' || item.category === 'deadline';

function matchesFilter(item: DBBaggageItem, filter: FilterId): boolean {
  if (filter === 'archive') return isArchived(item);
  if (isArchived(item)) return false; // Hide archived items from other tabs

  switch (filter) {
    case 'urgent':
      return item.urgency === 'high';
    case 'academic':
      return isAcademicGroup(item);
    case 'personal':
      return !isAcademicGroup(item);
    default:
      return true;
  }
}

function BackpackSVG({ itemsBySlot }: { itemsBySlot: Record<SlotKey, DBBaggageItem[]> }) {
  return (
    <div className="relative w-64 h-80 mx-auto">
       <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-xl overflow-visible">
         {/* Shoulder straps */}
         <path d="M 60 50 C 30 10, 10 80, 40 180" fill="none" stroke="#4c1d95" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
         <path d="M 140 50 C 170 10, 190 80, 160 180" fill="none" stroke="#4c1d95" strokeWidth="12" strokeLinecap="round" opacity="0.8" />
         
         {/* Top handle */}
         <path d="M 80 45 C 80 15, 120 15, 120 45" fill="none" stroke="#6d28d9" strokeWidth="10" strokeLinecap="round" />
         
         {/* Main Body (Main Pocket - algo) */}
         <rect x="40" y="60" width="120" height="150" rx="30" fill="#a78bfa" />
         
         {/* Side Mesh Left (chat) */}
         <path d="M 40 120 C 15 120, 15 180, 40 185 Z" fill="#ddd6fe" />
         
         {/* Side Mesh Right */}
         <path d="M 160 120 C 185 120, 185 180, 160 185 Z" fill="#ddd6fe" />

         {/* Top Flap (presentation) */}
         <path d="M 35 60 Q 100 20 165 60 L 155 110 Q 100 140 45 110 Z" fill="#7c3aed" />
         {/* Buckles */}
         <rect x="70" y="100" width="12" height="35" fill="#4c1d95" rx="3" />
         <rect x="118" y="100" width="12" height="35" fill="#4c1d95" rx="3" />
         
         {/* Front Pouch (walk) */}
         <rect x="60" y="140" width="80" height="55" rx="15" fill="#c4b5fd" />
         <path d="M 60 160 Q 100 170 140 160" fill="none" stroke="#8b5cf6" strokeWidth="3" opacity="0.5" />

         {/* Badges for counts */}
         {/* Top Flap - presentation */}
         {itemsBySlot.presentation.length > 0 && (
           <g transform="translate(100, 75)">
             <circle cx="0" cy="0" r="14" fill="#fb923c" stroke="#fff" strokeWidth="2" />
             <text x="0" y="5" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="sans-serif">{itemsBySlot.presentation.length}</text>
           </g>
         )}

         {/* Main pocket - algo */}
         {itemsBySlot.algo.length > 0 && (
           <g transform="translate(100, 122)">
             <circle cx="0" cy="0" r="14" fill="#f43f5e" stroke="#fff" strokeWidth="2" />
             <text x="0" y="5" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="sans-serif">{itemsBySlot.algo.length}</text>
           </g>
         )}

         {/* Front pouch - walk */}
         {itemsBySlot.walk.length > 0 && (
           <g transform="translate(100, 165)">
             <circle cx="0" cy="0" r="14" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
             <text x="0" y="5" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="sans-serif">{itemsBySlot.walk.length}</text>
           </g>
         )}

         {/* Side mesh - chat */}
         {itemsBySlot.chat.length > 0 && (
           <g transform="translate(30, 150)">
             <circle cx="0" cy="0" r="14" fill="#10b981" stroke="#fff" strokeWidth="2" />
             <text x="0" y="5" fontSize="14" fontWeight="bold" fill="#fff" textAnchor="middle" fontFamily="sans-serif">{itemsBySlot.chat.length}</text>
           </g>
         )}
       </svg>
    </div>
  );
}

export default function MyBag() {
  const { t } = useTranslation();
  const [items, setItems] = useState<DBBaggageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newThoughtTitle, setNewThoughtTitle] = useState('');
  const [selectedPocket, setSelectedPocket] = useState<PocketName>('Main Pocket');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBagItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !user) throw new Error('Not authenticated');

      const { data, error: dbErr } = await supabase
        .from('baggage_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (dbErr) throw dbErr;

      setItems((data ?? []) as DBBaggageItem[]);
    } catch (err: any) {
      console.error('Fetch bag error:', err);
      setError(err?.message || 'Failed to load bag items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBagItems();
  }, [fetchBagItems]);

  const changeStatus = async (id: string, newStatus: Status) => {
    try {
      const { error: err } = await supabase.from('baggage_items').update({ status: newStatus }).eq('id', id);
      if (err) throw err;
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error: err } = await supabase.from('baggage_items').delete().eq('id', id);
      if (err) throw err;
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => URGENCY_RANK[b.urgency] - URGENCY_RANK[a.urgency]),
    [items]
  );

  const activeItems = useMemo(() => sortedItems.filter((i) => !isArchived(i)), [sortedItems]);

  const visibleItems = useMemo(
    () => sortedItems.filter((i) => matchesFilter(i, activeFilter)),
    [sortedItems, activeFilter]
  );

  const itemsBySlot = useMemo(() => {
    const map: Record<SlotKey, DBBaggageItem[]> = { presentation: [], algo: [], chat: [], walk: [] };
    activeItems.forEach((i) => map[slotFor(i)].push(i));
    return map;
  }, [activeItems]);

  const load = activeItems.reduce((sum, i) => sum + URGENCY_RANK[i.urgency], 0);
  const capacityPercent = Math.min(100, Math.round((load / CAPACITY_POINTS) * 100));

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: t('mybag.filterAll', 'All'), count: activeItems.length },
    { id: 'urgent', label: t('mybag.filterUrgent', 'Urgent'), count: activeItems.filter(i => i.urgency === 'high').length },
    { id: 'academic', label: t('mybag.filterAcademic', 'Academic'), count: activeItems.filter(isAcademicGroup).length },
    { id: 'personal', label: t('mybag.filterPersonal', 'Personal'), count: activeItems.filter(i => !isAcademicGroup(i)).length },
  ];

  return (
    <div className="w-full">
      <section className="max-w-[1180px] mx-auto w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        {/* Top Banner */}
        <div className="relative bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-sm overflow-hidden mb-space-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="space-y-space-xs max-w-2xl">
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                {t('mybag.title', 'My Bag')}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('mybag.subtitle', 'Collection of unpacked mental baggage & thoughts')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm self-start md:self-center">
              <Link
                to="/unpack"
                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>{t('mybag.packItem', 'Pack New Item')}</span>
              </Link>

              <Link
                to="/unwind"
                state={{ scrollTo: 'quick-resets' }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-outline-variant/60 bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-[13px] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">spa</span>
                <span>{t('mybag.quickResets', 'Quick Resets')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading & Error */}
        {isLoading && <LoadingState message="Loading your bag..." />}

        {/* Empty State */}
        {!isLoading && !error && items.length === 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-sm mb-space-xl text-center">
            <EmptyState
              title={t('mybag.empty', 'Your bag is empty! Start unpacking your thoughts now.')}
              message=""
            />
            <div className="mt-space-md">
              <Link
                to="/unpack"
                className="inline-flex items-center gap-space-xs px-space-xl py-space-md rounded-full bg-primary text-on-primary font-label-lg shadow-[0_3px_0_#5516be] cursor-pointer"
              >
                <span>{t('nav.unpack', 'Unpack')}</span>
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </Link>
            </div>
          </div>
        )}

        {/* Content layout */}
        {!isLoading && !error && items.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-space-lg items-start">
            
            {/* Backpack Visualizer */}
            <div className="w-full lg:w-1/3 shrink-0 bg-surface-container-low rounded-2xl p-space-lg flex flex-col items-center border border-outline-variant/20">
              <h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface mb-2">
                Inside Your Bag
              </h3>
              <p className="text-body-sm text-center text-on-surface-variant mb-6">
                Your tasks are automatically sorted into different pockets based on urgency and category.
              </p>
              
              <BackpackSVG itemsBySlot={itemsBySlot} />
              
              <div className="mt-6 w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#fb923c]"></span> Top Flap (Immediate)</span>
                  <span className="font-bold text-on-surface">{itemsBySlot.presentation.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#f43f5e]"></span> Main Pocket (Academic)</span>
                  <span className="font-bold text-on-surface">{itemsBySlot.algo.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#3b82f6]"></span> Front Pouch (Self-Care)</span>
                  <span className="font-bold text-on-surface">{itemsBySlot.walk.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium text-on-surface-variant bg-surface-container-lowest p-2 rounded-lg shadow-sm border border-outline-variant/30">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10b981]"></span> Side Mesh (Social)</span>
                  <span className="font-bold text-on-surface">{itemsBySlot.chat.length}</span>
                </div>
              </div>
            </div>

            {/* List side */}
            <div className="w-full lg:w-2/3 space-y-space-md">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 overflow-x-auto gap-4">
                <div className="flex items-center gap-space-xs">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-4 py-2 rounded-full font-label-md text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeFilter === f.id
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setActiveFilter('archive')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === 'archive'
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'text-primary hover:bg-primary/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                  Unpacked History
                </button>
              </div>

              {/* Items list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {visibleItems.map((item) => {
                  const isResolved = item.status === 'completed';
                  
                  return (
                    <div
                      key={item.id}
                      className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between transition-all duration-300 ${
                        isResolved ? 'opacity-70 bg-surface-container-low grayscale-[20%]' : ''
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isResolved ? 'bg-surface-variant text-on-surface-variant line-through' : 'bg-surface-container text-on-surface-variant'}`}>
                            {CATEGORY_EMOJI[item.category] ?? '📌'} {t(`unpack.category.${item.category}`, item.category)}
                          </span>
                          <span className={`text-xs font-bold uppercase ${isResolved ? 'text-on-surface-variant line-through' : 'text-primary'}`}>
                            {t(`unpack.urgency.${item.urgency}`, item.urgency)}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3 mb-2">
                          <button
                            onClick={() => changeStatus(item.id, isResolved ? 'pending' : 'completed')}
                            className={`shrink-0 mt-0.5 cursor-pointer flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                              isResolved 
                                ? 'bg-primary border-primary text-on-primary' 
                                : 'border-outline hover:border-primary hover:bg-primary/10 text-transparent'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                          </button>
                          <h3 className={`font-headline-sm text-base font-semibold pt-0.5 ${isResolved ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                            {item.title}
                          </h3>
                        </div>

                        {item.action_step && (
                          <p className={`text-body-sm text-xs p-2.5 rounded-lg ml-9 mt-2 ${isResolved ? 'text-on-surface-variant bg-surface-variant/40 line-through' : 'text-on-surface-variant bg-surface-container-low'}`}>
                            💡 {item.action_step}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between ml-9">
                        <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                          {isResolved ? (
                            <><span className="material-symbols-outlined text-[14px]">done_all</span> {t('mybag.statusResolved', 'Resolved')}</>
                          ) : (
                            <><span className="material-symbols-outlined text-[14px]">backpack</span> {t('mybag.statusPending', 'In Bag')}</>
                          )}
                        </span>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="text-xs text-error hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          {t('mybag.delete', 'Hapus')}
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {visibleItems.length === 0 && (
                  <div className="col-span-full py-8 text-center text-on-surface-variant text-sm">
                    No items found for this filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}