import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PaxChat from '@/components/PaxChat';
import { useTranslation } from '@/i18n';
import { supabase } from '@/lib/supabaseClient';
import {
  unpackMindDump,
  UnpackError,
  type BaggageItem,
  type UnpackState,
  initialUnpackState,
} from '@/services/unpackService';

type FilterCategory = 'all' | 'academic' | 'social' | 'personal' | 'deadline' | 'health' | 'financial' | 'other';

const weightLevels: Record<number, string> = {
  1: 'Light 🎒',
  2: 'Medium 🎒🎒',
  3: 'Heavy 🎒🎒🎒',
};

const CATEGORY_EMOJI: Record<string, string> = {
  academic: '📚',
  deadline: '📅',
  social: '👥',
  personal: '🪫',
  health: '💚',
  financial: '💰',
  other: '📌',
};

const URGENCY_COLORS: Record<string, { bg: string; text: string; dot: string; tape: string }> = {
  high: {
    bg: 'bg-error-container',
    text: 'text-on-error-container',
    dot: 'bg-error animate-ping',
    tape: 'bg-red-200/70',
  },
  medium: {
    bg: 'bg-tertiary-fixed',
    text: 'text-on-tertiary-fixed-variant',
    dot: 'bg-tertiary',
    tape: 'bg-amber-200/70',
  },
  low: {
    bg: 'bg-secondary-fixed',
    text: 'text-on-secondary-fixed-variant',
    dot: 'bg-secondary',
    tape: 'bg-emerald-200/70',
  },
};

export default function Unpack() {
  const { t, locale } = useTranslation();
  const navigate = useNavigate();

  const defaultInputText = t(
    'unpack.defaultInput',
    "Tomorrow I have a presentation and I haven't finished my slides. My algorithm assignment is also due soon, my group hasn't replied, and I have a meeting tonight. I'm really tired and I don't know where to even begin…"
  );

  const [rawText, setRawText] = useState<string | null>(null);
  const text = rawText ?? defaultInputText;

  const [weight, setWeight] = useState(3);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [unpackState, setUnpackState] = useState<UnpackState>(initialUnpackState);
  const [showChat, setShowChat] = useState(false);

  // Selection & Saving state
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const items = unpackState.data?.items ?? [];

  // When AI returns results, select all items by default
  useEffect(() => {
    if (unpackState.data && unpackState.data.items.length > 0) {
      setSelectedIndices(unpackState.data.items.map((_, i) => i));
      setSaveSuccessMessage(null);
      setSaveError(null);
    } else {
      setSelectedIndices([]);
    }
  }, [unpackState.data]);

  const handleClear = useCallback(() => {
    setRawText('');
    setUnpackState(initialUnpackState);
    setSelectedIndices([]);
    setSaveSuccessMessage(null);
    setSaveError(null);
  }, []);

  const handleUnpack = useCallback(async () => {
    if (unpackState.isLoading) return;

    setUnpackState({ isLoading: true, error: null, data: null });
    setSaveSuccessMessage(null);
    setSaveError(null);

    try {
      const result = await unpackMindDump(text, locale);
      setUnpackState({ isLoading: false, error: null, data: result });
    } catch (err) {
      console.error('handleUnpack caught error:', err);
      const errorKey = err instanceof UnpackError ? err.i18nKey : 'unpack.error.unknown';
      setUnpackState({ isLoading: false, error: errorKey, data: null });
    }
  }, [text, unpackState.isLoading]);

  const handleToggleSelect = useCallback((index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    if (selectedIndices.length === items.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(items.map((_, i) => i));
    }
  }, [selectedIndices.length, items]);

  const handleSaveToBag = useCallback(async () => {
    if (selectedIndices.length === 0 || !unpackState.data?.unloadId || isSaving) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccessMessage(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Not authenticated');
      }

      const selectedItems = selectedIndices
        .map((index) => items[index])
        .filter((item): item is BaggageItem => item !== undefined);

      const insertRows = selectedItems.map((item) => ({
        unload_id: unpackState.data!.unloadId,
        user_id: user.id,
        title: item.title,
        category: item.category,
        urgency: item.urgency,
        action_step: item.actionStep,
        status: 'pending',
      }));

      const { error: dbError } = await supabase.from('baggage_items').insert(insertRows);

      if (dbError) {
        console.error('Save to bag error:', dbError);
        throw dbError;
      }

      setSaveSuccessMessage(
        locale === 'id'
          ? `${selectedItems.length} item berhasil disimpan ke Tas Saya! 🎒`
          : `${selectedItems.length} item${selectedItems.length > 1 ? 's' : ''} saved to My Bag! 🎒`
      );
    } catch (err: any) {
      console.error('Save to bag failed:', err);
      setSaveError(err.message || 'Failed to save items to bag.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedIndices, items, unpackState.data, isSaving, locale]);

  const handleFilterClick = useCallback((category: FilterCategory) => {
    setActiveFilter(category);
  }, []);

  const isCardVisible = (cardCategory: string) => {
    if (activeFilter === 'all') return true;
    return activeFilter === cardCategory;
  };

  // Build filter tabs from actual results
  const categoryCounts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  const filterTabs: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: `${t('mybag.filterAll', 'All')} (${items.length})` },
    ...Object.entries(categoryCounts).map(([cat, count]) => ({
      key: cat as FilterCategory,
      label: `${CATEGORY_EMOJI[cat] ?? '📌'} ${t(`unpack.category.${cat}`)} (${count})`,
    })),
  ];

  // Determine button state
  const buttonState = unpackState.isLoading ? 'loading' : unpackState.data ? 'success' : 'idle';

  return (
    <div className="flex flex-col w-full">
      <div className="w-full max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md">
        {/* Top Step Bar & Overline */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-lg">
          <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full shadow-sm w-fit">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-label-md text-primary font-bold uppercase tracking-wider">
              {t('unpack.stepBar', 'Step 01 of 02')}
            </span>
            <span className="text-outline text-label-md">•</span>
            <span className="text-label-md text-on-surface-variant">
              {t('unpack.stepTitle', 'Brain Dump & Sorting')}
            </span>
          </div>
        </div>

        {/* Main Section Header */}
        <div className="relative mb-space-xl">
          <div className="max-w-3xl">
            <h1 className="text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs">
              {t('unpack.mainHeading', "What's taking up space in your mind right now?")}
            </h1>
            <p className="text-body-lg text-on-surface-variant leading-relaxed">
              {t(
                'unpack.mainSubheading',
                "Dump it all out. Don't worry about spelling, punctuation, or organizing it. Pax will sift through the noise and help sort the weight."
              )}
            </p>
          </div>
          <div className="hidden lg:block absolute -right-4 -top-3 w-28 h-6 bg-amber-100/70 rotate-3 rounded-sm shadow-sm pointer-events-none mix-blend-multiply opacity-80" />
        </div>

        {/* Bento Upper Desk: Mind Dump Sandbox & Pax Speech Companion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start mb-space-xl">
          {/* Input Sandbox */}
          <div className="lg:col-span-8 flex flex-col relative">
            <div className="absolute -top-3 left-12 w-24 h-6 bg-yellow-200/60 -rotate-2 rounded-sm shadow-xs z-10 pointer-events-none mix-blend-multiply" />
            <div className="absolute -top-3 right-16 w-20 h-5 bg-purple-200/70 rotate-1 rounded-sm shadow-xs z-10 pointer-events-none mix-blend-multiply" />

            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md relative group transition-all duration-300">
              <div className="flex items-center justify-between border-b border-surface-variant/40 pb-space-xs mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">edit_note</span>
                  <span className="text-label-md text-on-surface-variant">
                    {t('unpack.sheetTitle', 'Looseleaf Thought Sheet')}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-on-surface-variant hover:text-error transition-colors text-label-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">ink_eraser</span>{' '}
                    {t('unpack.clear', 'Clear')}
                  </button>
                  <button
                    type="button"
                    className="text-primary hover:text-on-primary-fixed-variant transition-colors text-label-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">mic</span>{' '}
                    {t('unpack.voiceDump', 'Voice Dump')}
                  </button>
                </div>
              </div>

              <div className="relative w-full">
                <textarea
                  className="w-full bg-transparent text-body-lg text-on-surface placeholder:text-outline/70 focus:outline-none resize-y leading-[32px] tracking-normal border-none"
                  placeholder={t(
                    'unpack.placeholder',
                    'Dump everything here... exams, late laundry, messy texts, unread emails...'
                  )}
                  rows={6}
                  value={text}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={unpackState.isLoading}
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(transparent, transparent 31px, rgba(123, 116, 134, 0.08) 31px, rgba(123, 116, 134, 0.08) 32px)',
                    backgroundAttachment: 'local',
                  }}
                />
              </div>

              {/* Error message */}
              {unpackState.error && (
                <div className="mt-space-sm px-space-md py-space-xs bg-error-container rounded-lg flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-on-error-container text-[18px]">error</span>
                  <span className="text-body-sm text-on-error-container">{t(unpackState.error)}</span>
                </div>
              )}

              <div className="mt-space-md pt-space-sm border-t border-surface-variant/40 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                {/* Quick Bag Weight Slider */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-space-xs sm:gap-space-sm bg-surface-container-low px-space-md py-space-xs rounded-full">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">backpack</span>
                    <span className="text-label-sm uppercase font-bold text-on-surface-variant">
                      {t('unpack.mentalWeight', 'Mental Weight:')}
                    </span>
                  </div>
                  <div className="flex items-center gap-space-xs">
                    <input
                      type="range"
                      min={1}
                      max={3}
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="w-24 accent-primary cursor-pointer"
                    />
                    <span className="text-label-md text-tertiary font-bold">{weightLevels[weight]}</span>
                  </div>
                </div>

                {/* Unpack Button */}
                <button
                  type="button"
                  onClick={handleUnpack}
                  disabled={unpackState.isLoading}
                  className="inline-flex items-center justify-center gap-space-xs px-space-xl py-space-sm rounded-full bg-primary text-on-primary text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {buttonState === 'loading' ? (
                    <>
                      <span>{t('unpack.button.loading')}</span>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    </>
                  ) : buttonState === 'success' ? (
                    <>
                      <span>{t('unpack.button.success')}</span>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </>
                  ) : (
                    <>
                      <span>{t('unpack.button.idle')}</span>
                      <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">
                        auto_awesome
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* PAX Companion — Chat Entry Card */}
          <div className="lg:col-span-4 flex flex-col gap-space-md">
            <div
              className="bg-surface-container-high rounded-xl p-space-lg shadow-sm relative overflow-hidden transition-all hover:shadow-md cursor-pointer group"
              onClick={() => setShowChat(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowChat(true)}
            >
              <div className="absolute -top-2 left-6 w-16 h-5 bg-amber-200/80 rotate-2 rounded-xs shadow-xs pointer-events-none mix-blend-multiply" />

              <div className="flex items-center gap-space-md mb-space-md">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center shadow-inner overflow-hidden ring-4 ring-surface-container-lowest">
                    <img src="/unpack_logo.png" alt="PAX" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center ring-2 ring-surface-container-high">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  </span>
                </div>
                <div>
                  <span className="text-label-sm font-bold text-primary uppercase tracking-wider">
                    {t('unpack.paxCardTitle', 'PAX • Your Companion')}
                  </span>
                </div>
              </div>

              <p className="text-body-md text-on-surface leading-relaxed mb-space-lg">
                {t('unpack.paxCardDesc', "I'm here to listen, no judgement.")}
              </p>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-primary text-on-primary text-label-lg shadow-[0_3px_0_#5516be] group-hover:translate-y-[1px] group-hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
              >
                <span>{t('unpack.paxCardBtn', 'Talk to PAX')}</span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>

          {/* PAX Chat Overlay */}
          {showChat && <PaxChat onClose={() => setShowChat(false)} />}
        </div>

        {/* Live Unpacked Baggage Section — only show when we have results */}
        {items.length > 0 && (
          <div className="w-full mt-space-xl pt-space-lg border-t border-surface-variant/40">
            {/* Section Banner */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
              <div>
                <div className="flex items-center gap-space-xs mb-space-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-label-sm font-bold uppercase tracking-wider">
                    {t('unpack.results.sorted')}
                  </span>
                  <span className="text-label-sm text-on-surface-variant">
                    • {items.length} {t('unpack.results.subtitle')}
                  </span>
                </div>
                <h2 className="text-headline-lg text-on-surface tracking-tight">
                  {t('unpack.results.title')}
                </h2>
              </div>

              {/* Selection Bar Actions */}
              <div className="flex items-center gap-space-sm bg-surface-container px-space-md py-space-xs rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-label-md font-bold text-primary hover:underline cursor-pointer"
                >
                  {selectedIndices.length === items.length
                    ? t('unpack.deselectAll', 'Deselect All')
                    : t('unpack.selectAll', 'Select All')}
                </button>
                <span className="text-outline">•</span>
                <span className="text-body-sm text-on-surface-variant">
                  <strong className="text-on-surface">{selectedIndices.length}</strong> of {items.length}{' '}
                  {t('unpack.selectedCount', 'selected')}
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-sm mb-space-lg">
              {filterTabs.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleFilterClick(key)}
                  className={`px-space-md py-space-xs rounded-full text-label-md whitespace-nowrap cursor-pointer transition-all ${
                    activeFilter === key
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Dynamic Baggage Cards Grid with Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
              {items.map((item, index) => {
                if (!isCardVisible(item.category)) return null;
                const isSelected = selectedIndices.includes(index);
                return (
                  <BaggageCard
                    key={index}
                    item={item}
                    t={t}
                    isSelected={isSelected}
                    onToggle={() => handleToggleSelect(index)}
                  />
                );
              })}
            </div>

            {/* Save to Bag Bar */}
            <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md mb-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md border border-outline-variant/30">
              <div className="flex items-center gap-space-md w-full md:w-auto">
                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shrink-0">
                  <span className="material-symbols-outlined text-[24px]">backpack</span>
                </div>
                <div>
                  <h3 className="text-headline-sm text-on-surface font-bold">
                    {t('unpack.saveSectionTitle', 'Select items to put in your Bag')}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {selectedIndices.length === 0
                      ? t('unpack.saveSectionDesc0', 'Check the items above that you want to carry today.')
                      : t('unpack.saveSectionDescN', 'Ready to save selected items to My Bag.')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-space-sm w-full md:w-auto">
                <button
                  type="button"
                  onClick={handleSaveToBag}
                  disabled={selectedIndices.length === 0 || isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-xl py-space-md rounded-full bg-secondary text-on-secondary text-label-lg font-bold shadow-[0_3px_0_#005236] hover:translate-y-[1px] hover:shadow-[0_2px_0_#005236] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSaving ? (
                    <>
                      <span>{t('unpack.saving', 'Saving to Bag…')}</span>
                      <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">add_task</span>
                      <span>
                        {t('unpack.saveToBag', 'Save to My Bag 🎒')} ({selectedIndices.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Save Success Banner */}
            {saveSuccessMessage && (
              <div className="mb-space-xl p-space-md rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-between gap-space-md shadow-md animate-fade-in">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary text-2xl">check_circle</span>
                  <div>
                    <h4 className="font-headline-sm text-headline-sm font-bold">{saveSuccessMessage}</h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/my-bag')}
                  className="px-space-md py-space-xs rounded-full bg-secondary text-on-secondary text-label-md font-bold hover:opacity-90 transition-all cursor-pointer whitespace-nowrap"
                >
                  {t('unpack.openMyBag', 'Open My Bag →')}
                </button>
              </div>
            )}

            {/* Save Error Banner */}
            {saveError && (
              <div className="mb-space-xl p-space-md rounded-xl bg-error-container text-on-error-container flex items-center gap-space-sm shadow-sm">
                <span className="material-symbols-outlined text-error text-2xl">error</span>
                <p className="text-body-sm text-on-error-container">{saveError}</p>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {unpackState.isLoading && (
          <div className="w-full mt-space-xl pt-space-lg border-t border-surface-variant/40">
            <div className="flex flex-col items-center justify-center py-space-xl gap-space-md">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-primary text-[32px] animate-spin">
                  progress_activity
                </span>
              </div>
              <p className="text-body-lg text-on-surface-variant">{t('unpack.loading')}</p>
            </div>
          </div>
        )}

        {/* Bottom Step 02 Anchor Bar */}
        <div className="bg-surface-container-highest/60 backdrop-blur-md rounded-2xl p-space-lg md:p-space-xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-space-lg border border-outline-variant/30">
          <div className="flex items-center gap-space-md text-center sm:text-left">
            <div className="hidden sm:flex w-12 h-12 rounded-full bg-primary text-on-primary items-center justify-center font-bold text-headline-sm shadow-sm">
              2
            </div>
            <div>
              <span className="text-label-sm uppercase tracking-wider text-primary font-bold">
                {t('unpack.nextPhaseLabel', 'Next Phase')}
              </span>
              <h3 className="text-headline-md text-on-surface">
                {t('unpack.nextPhaseTitle', 'Feeling ready for one small step?')}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {t(
                  'unpack.nextPhaseDesc',
                  "We'll take just the single top priority card for a frictionless 10-minute start."
                )}
              </p>
            </div>
          </div>
          <Link
            to="/unwind#small-action-section"
            className="inline-flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-full bg-primary text-on-primary text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer whitespace-nowrap"
          >
            <span>{t('unpack.btnNextPhase', 'Proceed to Small Action')}</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Renders a single baggage card with dynamic styling based on urgency/category and a selection checkbox */
function BaggageCard({
  item,
  t,
  isSelected,
  onToggle,
}: {
  item: BaggageItem;
  t: (key: string, fallback?: string) => string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const colors = URGENCY_COLORS[item.urgency] ?? URGENCY_COLORS.medium!;
  const emoji = CATEGORY_EMOJI[item.category] ?? '📌';

  return (
    <div
      onClick={onToggle}
      className={`baggage-card group relative rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer border-2 ${
        isSelected
          ? 'bg-surface-container-lowest border-secondary ring-2 ring-secondary/30'
          : 'bg-surface-container-lowest/80 border-transparent opacity-80 hover:opacity-100'
      }`}
    >
      {/* Washi tape */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 ${colors.tape} rotate-[-1deg] rounded-xs shadow-xs pointer-events-none mix-blend-multiply group-hover:rotate-0 transition-transform`}
      />

      <div>
        <div className="flex items-center justify-between mb-space-sm pt-1">
          <span
            className={`px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} text-label-sm font-bold tracking-wide uppercase flex items-center gap-1`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
            {t(`unpack.urgency.${item.urgency}`, item.urgency)}
          </span>

          {/* Selection Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'bg-surface-container border border-outline-variant text-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] font-bold">check</span>
          </div>
        </div>

        <h3 className="text-headline-sm text-on-surface mb-1">{item.title}</h3>

        <p className="text-label-md text-on-surface-variant mb-space-md flex items-center gap-1">
          <span>
            {emoji} {t(`unpack.category.${item.category}`, item.category)}
          </span>
        </p>
      </div>

      {/* PAX Note */}
      <div className="bg-amber-50/80 rounded-lg p-space-sm mt-space-sm relative">
        <div className="flex items-start gap-1.5">
          <span className="material-symbols-outlined text-tertiary text-[16px] shrink-0 mt-0.5">
            lightbulb
          </span>

          <p className="text-body-sm text-on-surface leading-tight">
            <strong className="text-tertiary">{t('unpack.results.paxNote', 'Pax note:')}</strong> "{item.actionStep}"
          </p>
        </div>
      </div>
    </div>
  );
}
