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
  if (isArchived(item)) return false;
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

function PocketSlot({
  slot,
  items,
  onClick,
  t,
}: {
  slot: (typeof SLOTS)[number];
  items: DBBaggageItem[];
  onClick: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  const first = items[0];
  const extra = items.length - 1;
  const empty = items.length === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={empty}
      className={`w-full p-space-md rounded-xl text-left border transition-all ${
        empty
          ? 'bg-surface-container-low/40 border-outline-variant/20 opacity-50 cursor-not-allowed'
          : 'bg-surface-container-lowest border-outline-variant/40 hover:border-primary cursor-pointer shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-label-md font-bold text-on-surface flex items-center gap-1.5">
          <span>{slot.emoji}</span>
          <span>{t(slot.labelKey, slot.fallback)}</span>
        </span>
        <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container font-bold text-on-surface-variant">
          {items.length}
        </span>
      </div>
      {first && (
        <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 line-clamp-1">
          {first.title} {extra > 0 && <span className="font-bold text-primary">(+{extra})</span>}
        </p>
      )}
    </button>
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

  const filters: { id: FilterId; label: string }[] = [
    { id: 'all', label: t('mybag.filterAll', 'All') },
    { id: 'urgent', label: t('mybag.filterUrgent', 'Urgent') },
    { id: 'academic', label: t('mybag.filterAcademic', 'Academic') },
    { id: 'personal', label: t('mybag.filterPersonal', 'Personal') },
  ];

  return (
    <div className="w-full">
      <section className="max-w-[1180px] mx-auto w-full px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        {/* Top Banner */}
        <div className="relative bg-surface-container-low rounded-xl p-space-md md:p-space-lg shadow-sm overflow-hidden mb-space-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="space-y-space-xs max-w-2xl">
              <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-1 rounded-full shadow-sm">
                <span className="text-sm leading-none">🎒</span>
                <span className="font-label-md text-label-md text-on-surface font-semibold">
                  {capacityPercent >= 100 ? t('mybag.capacityFull', 'Bag Full!') : t('mybag.capacityOk', 'Bag Capacity Safe')}: {capacityPercent}%
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
                {t('mybag.title', 'My Bag')}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('mybag.subtitle', 'Collection of unpacked mental baggage & thoughts')}
              </p>
            </div>

            <div className="flex items-center gap-space-sm self-start md:self-center">
              <Link
                to="/unpack"
                className="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>{t('mybag.packItem', 'Pack New Item')}</span>
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

        {/* Content list */}
        {!isLoading && !error && items.length > 0 && (
          <div className="space-y-space-md">
            {/* Filter Tabs */}
            <div className="flex items-center gap-space-xs border-b border-outline-variant/30 pb-2">
              {filters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2 rounded-full font-label-md text-sm font-semibold transition-all cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Items list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                        {CATEGORY_EMOJI[item.category] ?? '📌'} {t(`unpack.category.${item.category}`, item.category)}
                      </span>
                      <span className="text-xs font-bold text-primary uppercase">
                        {t(`unpack.urgency.${item.urgency}`, item.urgency)}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-base text-on-surface font-semibold mb-2">{item.title}</h3>
                    {item.action_step && (
                      <p className="text-body-sm text-xs text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                        💡 {item.action_step}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                    <button
                      onClick={() => changeStatus(item.id, item.status === 'completed' ? 'pending' : 'completed')}
                      className="text-xs font-bold text-primary hover:underline cursor-pointer"
                    >
                      {item.status === 'completed' ? t('mybag.markUnresolved', 'Buka Kembali') : t('mybag.markResolved', 'Tandai Selesai')}
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-xs text-error hover:underline cursor-pointer"
                    >
                      {t('mybag.delete', 'Hapus')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}