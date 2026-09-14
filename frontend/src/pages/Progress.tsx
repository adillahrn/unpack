import { useState } from 'react';

export default function Progress() {
  const [sliderValue, setSliderValue] = useState(50);
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);

  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2000);
  };

  const stats = [
    { icon: 'backpack', label: 'Items Unpacked', value: '14', sublabel: 'this week', color: 'primary' },
    { icon: 'play_circle', label: 'Micro-steps Done', value: '9', sublabel: 'completed', color: 'tertiary' },
    { icon: 'fitness_center', label: 'Weight Lifted', value: '3.8 kg', sublabel: 'mental load', color: 'secondary' },
    { icon: 'local_fire_department', label: 'Streak', value: '4 days', sublabel: 'keep going!', color: 'error' },
  ];

  const badges = [
    { emoji: '🌱', title: 'First Unpack', desc: 'Dumped your first thought', earned: true },
    { emoji: '🎯', title: 'Focus Starter', desc: 'Completed 1st micro-step', earned: true },
    { emoji: '🔥', title: '3-Day Streak', desc: 'Unpacked 3 days in a row', earned: true },
    { emoji: '🏕️', title: 'Campsite Setup', desc: 'Organized 10 items', earned: true },
    { emoji: '🌊', title: 'Deep Breath', desc: 'Used breathing exercise 5x', earned: false },
    { emoji: '⭐', title: 'Weekly Champion', desc: 'Unpack every day for a week', earned: false },
  ];

  return (
    <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl pb-[120px]">
      {/* Header */}
      <div className="mb-space-xl">
        <div className="flex items-center gap-space-sm mb-space-xs">
          <span className="material-symbols-outlined text-primary text-[28px]">insights</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Weekly Space Made</h1>
        </div>
        <p className="font-body-md text-on-surface-variant">Look at the breathing room you created this week.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/30 shadow-sm flex flex-col gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-fixed/30 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${stat.color} text-[20px]`}>{stat.icon}</span>
              </div>
            </div>
            <p className="font-display-lg-mobile text-[28px] text-on-surface font-extrabold leading-none mt-1">{stat.value}</p>
            <p className="font-label-md text-on-surface-variant">{stat.label}</p>
            <p className="font-label-sm text-outline">{stat.sublabel}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-gutter-desktop items-start">

        {/* Left Column */}
        <div className="flex flex-col gap-space-xl">

          {/* Empty Space Visualizer */}
          <section className="bg-surface-container-lowest rounded-3xl p-space-lg border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-on-surface-variant">compare</span>
              <h2 className="font-headline-sm text-on-surface">Empty Space Visualizer</h2>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-space-lg">Drag the slider to see how your desk went from chaotic to calm.</p>

            <div className="relative rounded-2xl overflow-hidden h-[280px] bg-surface-container">
              {/* After (calm) image — always visible behind */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPqhEmq3jhsxeixo5KY6RrU7xw-T_T-VneotFaG520jgakDImLRl556ZDbcVqpGpFVi6Pgg3Tl5LZudfvhSn0pPmTvzkSBatG-8zzlqC2t4F-YiSHEUrYAlMdfoZZ11QPggNjSO9dgEz_1bDVVgTGWENj2dUF9P5Pb3Hl7eChgsV9Cl2Afi1JVof75JkGATtiYhfU91oLFMoU-aBUEAJuUJtJFl0dJtjbJH6w1mbLspMC9ESA5Vaa"
                alt="Calm organized desk"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Before (chaotic) image — opacity controlled by slider */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg6F9O7ICCE7hITIPEjrgfb9cWl6i7s_yPTOrtM25R8ojp9rOGrhFh639ShQ7CdbG-c5QpCy0UBiixcKfCh-ySWqNPKA0gHMtS9C8uvGYFgVwiL6deolSFDdjx_MFh6rmKGSCsjadHaQXJhosmMY6OqRL9wCDkPHLJ10QCGWBLt4KKfkI7fcrMLQuHqFcRvPpJb2ALTQ3NFu1_Hwih7XWAym8nWGUE5Unus8lWzE29FjboWqnYS_tt"
                alt="Chaotic cluttered desk"
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                style={{ opacity: sliderValue / 100 }}
              />
              {/* Labels */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-error-container/80 text-error font-label-sm backdrop-blur-sm">Before</div>
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-secondary-container/80 text-secondary font-label-sm backdrop-blur-sm">After</div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              className="w-full mt-space-md accent-primary h-2 bg-surface-container rounded-full appearance-none"
            />
            <div className="flex justify-between font-label-sm text-outline mt-1">
              <span>Cluttered</span>
              <span>Clear</span>
            </div>
          </section>

          {/* Journal Reflection */}
          <section className="bg-surface-container-lowest rounded-3xl p-space-lg border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-on-surface-variant">edit_note</span>
              <h2 className="font-headline-sm text-on-surface">Weekly Reflection</h2>
            </div>
            <p className="font-body-sm text-on-surface-variant mb-space-md">How did this week feel? What would you do differently?</p>
            <textarea
              className="w-full min-h-[120px] p-space-md rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y transition-all"
              placeholder="This week I realized that..."
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
            />
            <div className="flex justify-end mt-space-sm">
              <button
                onClick={handleSaveJournal}
                className="px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">{journalSaved ? 'check_circle' : 'save'}</span>
                {journalSaved ? 'Saved!' : 'Save Reflection'}
              </button>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <aside className="flex flex-col gap-space-md">
          {/* Pax Weekly Message */}
          <div className="bg-primary-fixed/20 border border-primary-fixed rounded-3xl p-space-lg flex flex-col items-center text-center">
            <img
              src="https://lh3.googleusercontent.com/aida/AEtjO1Ukem3LNXgKtxLVnmwa5dfQrgc7ORW4-_FtCnt3HAc1TR5-24qTooqjP6KSuAzIqnqYz03t24sHJ8tc67C8DEqed7QWkShWQziQ2TkYp7AO7D0SOZbgKglsrFSNbNVEkFyNYjgJtghrcv5ih9Ncxy12TrbRTJQE2fAPcaz3l6KCflwIV46OypXPLe63z1HSB6IGLNqO4A4z8XfJRNWmmeJf3Z5ymQM9hoV6ZZ0PlSvSCd4vdXttjQUyeCg"
              alt="Pax celebrating"
              className="w-24 h-24 object-contain mb-space-md"
            />
            <h3 className="font-headline-sm text-on-primary-fixed-variant mb-space-xs">Pax's Weekly Note</h3>
            <p className="font-body-sm text-on-surface-variant">
              "You carried a lot this week and still made space. That's not nothing — that's everything. Rest well this weekend. 💜"
            </p>
          </div>

          {/* Campground Badges */}
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg border border-outline-variant/30 shadow-sm">
            <div className="flex items-center gap-space-sm mb-space-md">
              <span className="material-symbols-outlined text-tertiary text-[20px]">emoji_events</span>
              <h3 className="font-headline-sm text-on-surface">Campground Badges</h3>
            </div>
            <div className="grid grid-cols-3 gap-space-sm">
              {badges.map((badge) => (
                <div
                  key={badge.title}
                  className={`flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                    badge.earned
                      ? 'bg-tertiary-fixed/20 hover:bg-tertiary-fixed/30'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <span className="text-2xl mb-1">{badge.emoji}</span>
                  <p className="font-label-sm text-on-surface leading-tight">{badge.title}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
