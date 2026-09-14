import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Unpack() {
  const [text, setText] = useState('');
  const [weight, setWeight] = useState(50);
  const [isUnpacking, setIsUnpacking] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);

  const maxChars = 2000;
  const charsUsed = text.length;
  const isOverLimit = charsUsed > maxChars;

  const filters = ['All', 'Academic', 'Personal', 'Urgent'];
  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      let newFilters = selectedFilters.filter(f => f !== 'All');
      if (newFilters.includes(filter)) {
        newFilters = newFilters.filter(f => f !== filter);
        if (newFilters.length === 0) newFilters = ['All'];
      } else {
        newFilters.push(filter);
      }
      setSelectedFilters(newFilters);
    }
  };

  const handleUnpack = () => {
    if (!text.trim()) return;
    setIsUnpacking(true);
    setTimeout(() => {
      setIsUnpacking(false);
      setText('');
      // In a real app, we'd add the item to a list here
    }, 2000);
  };

  return (
    <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-xl pb-[120px]">
      
      {/* Phase Indicator */}
      <div className="mb-space-lg flex items-center gap-space-sm text-label-lg font-label-lg">
        <span className="text-primary bg-primary-container px-3 py-1 rounded-full">Step 01</span>
        <span className="text-on-surface-variant">Dump it all out</span>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-gutter-desktop relative items-start">
        
        {/* Left Column: The Dump Zone */}
        <div className="flex flex-col gap-space-xl">
          
          {/* Input Sandbox */}
          <section className="bg-surface-container-lowest rounded-3xl p-space-lg border border-outline-variant/50 shadow-[0_4px_12px_rgba(41,37,36,0.03)] flex flex-col gap-space-md">
            <div className="flex justify-between items-center">
              <h1 className="font-headline-md text-headline-md text-on-surface">What's occupying your mind?</h1>
              <button 
                onClick={() => setIsBreathing(true)}
                className="hidden sm:flex items-center gap-1 text-label-md font-label-md text-secondary bg-secondary-container px-3 py-1 rounded-full hover:bg-secondary-fixed transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">air</span>
                Take a breath
              </button>
            </div>
            
            <p className="font-body-md text-on-surface-variant">
              Write it down exactly as it feels. Don't worry about grammar, just get it out of your head.
            </p>

            <div className={`relative rounded-2xl border ${isOverLimit ? 'border-error' : 'border-outline-variant'} bg-surface focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden`}>
              <textarea 
                placeholder="I have a 3000 word essay due Friday, and my roommate is being loud, and I haven't done laundry..."
                className="w-full min-h-[200px] bg-transparent p-space-md font-body-lg text-on-surface resize-y focus:outline-none placeholder:text-on-surface-variant/50"
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>
              <div className={`absolute bottom-3 right-3 font-label-sm text-label-sm ${isOverLimit ? 'text-error' : 'text-on-surface-variant'}`}>
                {charsUsed} / {maxChars}
              </div>
            </div>

            {/* Intensity Slider */}
            <div className="pt-space-sm border-t border-outline-variant/30 flex flex-col gap-space-xs">
              <div className="flex justify-between items-center font-label-md text-on-surface">
                <span>Mental weight</span>
                <span className="text-primary font-bold">{weight} kg</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-surface-container rounded-full appearance-none outline-none"
              />
              <div className="flex justify-between font-label-sm text-outline">
                <span>Light</span>
                <span>Heavy</span>
              </div>
            </div>

            <div className="flex justify-end pt-space-sm">
              <button 
                onClick={handleUnpack}
                disabled={!text.trim() || isUnpacking || isOverLimit}
                className="px-space-xl py-space-md rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_4px_0_#5516be] hover:translate-y-[2px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:shadow-none disabled:translate-y-[4px] transition-all flex items-center gap-space-sm"
              >
                {isUnpacking ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Unpacking...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined filled">add_circle</span>
                    Pack into Bag
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Live Unpacked Baggage */}
          <section className="flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">Recently Unpacked</h2>
                <p className="font-body-sm text-on-surface-variant">Items currently sitting in your bag.</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                {filters.map(filter => (
                  <button 
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`shrink-0 px-3 py-1 rounded-full font-label-sm border transition-colors ${
                      selectedFilters.includes(filter) 
                        ? 'bg-surface-variant border-outline text-on-surface font-bold' 
                        : 'bg-transparent border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Baggage Cards */}
            <div className="grid sm:grid-cols-2 gap-space-md">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/40 flex flex-col gap-space-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-error"></div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1 font-label-sm text-error bg-error-container/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">priority_high</span> High Urgency
                  </div>
                  <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                </div>
                <h3 className="font-headline-sm text-on-surface leading-tight mt-1">Algorithm Assignment (3000 words)</h3>
                <div className="flex items-center gap-space-xs mt-auto pt-space-sm">
                  <span className="px-2 py-1 bg-primary-fixed/30 text-on-primary-fixed rounded text-[11px] font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">school</span> Academic
                  </span>
                  <span className="text-label-sm text-outline">~4 hours</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant/40 flex flex-col gap-space-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-tertiary-fixed-dim"></div>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1 font-label-sm text-tertiary bg-tertiary-container/30 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> Med Urgency
                  </div>
                  <button className="text-on-surface-variant hover:text-primary"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                </div>
                <h3 className="font-headline-sm text-on-surface leading-tight mt-1">Reply to mom's message</h3>
                <div className="flex items-center gap-space-xs mt-auto pt-space-sm">
                  <span className="px-2 py-1 bg-secondary-fixed/30 text-on-secondary-fixed-variant rounded text-[11px] font-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">person</span> Personal
                  </span>
                  <span className="text-label-sm text-outline">~5 mins</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-space-md">
              <Link to="/my-bag" className="text-primary font-label-md hover:underline flex items-center justify-center gap-1">
                View all items in bag <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Right Column: Pax Companion (Sticky) */}
        <aside className="hidden lg:flex flex-col sticky top-[100px]">
          <div className="bg-primary-fixed/20 border border-primary-fixed rounded-3xl p-space-lg flex flex-col items-center text-center">
            <div className="relative mb-space-md">
              <img src="https://lh3.googleusercontent.com/aida/AEtjO1Ukem3LNXgKtxLVnmwa5dfQrgc7ORW4-_FtCnt3HAc1TR5-24qTooqjP6KSuAzIqnqYz03t24sHJ8tc67C8DEqed7QWkShWQziQ2TkYp7AO7D0SOZbgKglsrFSNbNVEkFyNYjgJtghrcv5ih9Ncxy12TrbRTJQE2fAPcaz3l6KCflwIV46OypXPLe63z1HSB6IGLNqO4A4z8XfJRNWmmeJf3Z5ymQM9hoV6ZZ0PlSvSCd4vdXttjQUyeCg" alt="Pax listening" className="w-32 h-32 object-contain animate-[float_4s_ease-in-out_infinite]" />
              {isBreathing && (
                <div className="absolute -top-4 -right-4 bg-surface rounded-t-xl rounded-br-xl rounded-bl-sm p-3 shadow-md border border-outline-variant/30 text-xs animate-[fade-in_0.3s]">
                  Inhale... Exhale...
                </div>
              )}
            </div>
            <h3 className="font-headline-sm text-on-primary-fixed-variant mb-space-xs">I'm listening.</h3>
            <p className="font-body-sm text-on-surface-variant">Dump everything here. We'll sort it out together afterward.</p>
          </div>

          <div className="mt-space-lg bg-surface-container-lowest rounded-3xl p-space-md border border-outline-variant/50 shadow-sm flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-surface">center_focus_strong</span>
            </div>
            <div className="flex-1">
              <h4 className="font-label-md text-on-surface">Next Step</h4>
              <p className="font-body-sm text-on-surface-variant text-[12px]">Pick ONE thing to focus on.</p>
            </div>
            <Link to="/start-here" className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90">
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile "Next Step" FAB */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Link to="/start-here" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-3 rounded-full shadow-[0_4px_12px_rgba(107,56,212,0.4)]">
          <span className="font-label-md">Next Step</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
