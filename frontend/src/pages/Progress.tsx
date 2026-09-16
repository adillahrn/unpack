import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Progress() {
  const [sliderValue, setSliderValue] = useState(75);
  const [journalText, setJournalText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [paxMessage, setPaxMessage] = useState<string | null>(null);

  // Compute slider label text
  const getSliderLabel = (val: number) => {
    if (val > 70) return `${val}% Lighter (Airy)`;
    if (val > 35) return `${val}% Lighter (Steady)`;
    return 'Room to breathe forming...';
  };

  const handleSaveReflection = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 3500);
  };

  const handleTagClick = (tagText: string) => {
    setJournalText((prev) => (prev ? `${prev} #${tagText.replace(/\s+/g, '')}` : `#${tagText.replace(/\s+/g, '')}`));
  };

  const handlePaxCheer = () => {
    setPaxMessage("Pax nudges your cocoa closer: 'You did wonderful this week. Go get some proper sleep tonight!' ☕✨");
    setTimeout(() => setPaxMessage(null), 5000);
  };

  return (
    <div className="w-full">
      <div className="max-w-[1180px] w-full mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-lg md:py-space-xl flex flex-col gap-space-xl relative">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-fixed text-on-tertiary-fixed self-start shadow-sm transform -rotate-1">
              <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
              <span className="font-label-md text-label-md">Weekly Space Made</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight mt-space-xs">
              You’re making room.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Look how much weight you’ve put down this week. Every small step makes your backpack
              lighter, your desk clearer, and your head quieter.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-end bg-surface-container-low px-space-md py-space-sm rounded-full shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
            <span className="font-label-md text-label-md text-on-surface">
              Week 9 of Semester • Quiet Sunday
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Stat 1 */}
          <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="absolute -top-2 left-6 w-14 h-4 bg-tertiary-fixed opacity-70 rounded-xs transform -rotate-2 pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                Tidy
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                  14
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">items</span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mt-space-xs">
                Things Unpacked
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Mental clutter moved out of your head onto paper where it can't overwhelm you.
              </p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="absolute -top-2 right-8 w-12 h-4 bg-secondary-fixed opacity-70 rounded-xs transform rotate-2 pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">edit_note</span>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                Micro
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                  9
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  actions
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mt-space-xs">
                Micro-Steps Done
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                10-minute bursts that gently dissolved frozen task paralysis.
              </p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="absolute -top-2 left-10 w-16 h-4 bg-primary-fixed opacity-75 rounded-xs transform -rotate-1 pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-primary-fixed-dim/40 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">air</span>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-semibold">
                -42%
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                  3.8
                </span>
                <span className="font-headline-md text-headline-md text-primary font-bold">kg</span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mt-space-xs">
                Weight Lifted
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Estimated cognitive load dropped. Your backpack feels significantly lighter.
              </p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md group">
            <div className="absolute -top-2 right-6 w-14 h-4 bg-tertiary-fixed opacity-70 rounded-xs transform rotate-1 pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary transition-transform group-hover:scale-105">
                <span className="material-symbols-outlined text-[24px]">local_cafe</span>
              </div>
              <span className="font-label-sm text-label-sm px-space-xs py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-semibold">
                Paced
              </span>
            </div>
            <div className="mt-space-md">
              <div className="flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-extrabold">
                  4
                </span>
                <span className="font-label-md text-label-md text-on-surface-variant">
                  days steady
                </span>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mt-space-xs">
                Grounding Streak
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Showing up for yourself quietly, taking rests without guilt or hustle pressure.
              </p>
            </div>
          </div>
        </div>

        {/* Empty Space Visualizer Section */}
        <div className="bg-surface-container-low rounded-xl p-space-md md:p-space-lg flex flex-col gap-space-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
            <div>
              <div className="inline-flex items-center gap-space-xs text-primary font-label-md text-label-md uppercase tracking-wider mb-space-xs">
                <span className="material-symbols-outlined text-[18px]">backpack</span>
                The "Empty Space" Visualizer
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Look at that breathing room on your desk.
              </h2>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container px-space-sm py-1.5 rounded-full text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                check_circle
              </span>
              <span>Room for warm tea, open notebooks, and fresh air</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            {/* Visualizer Image Stack & Slider */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="relative w-full h-72 md:h-80 rounded-xl overflow-hidden shadow-md">
                {/* Before Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuADLMuYC9AGXvaG-iep9NnRraO9J4vcYbi5xxrLB8emFxbqpLFNULJqOAMI7CHG-U3LedKYYXucl-0bCHLV5JT6TgwlIuDWbT9gdpd2VhZk9zTKEg7SIwKVpI_kbxZYUT_t2DDcjS0zS6SXmD166MSWm_2BT4m_FoeG-VTepgt1-vgNSgPTKmZBuVR-iuADdy38ifMx4zzw2WTLgnukgH77E11FPK41VTSH-d2CM_NGIQbmBuxHT6N8')",
                  }}
                >
                  <div className="absolute top-4 left-4 px-space-sm py-1 bg-surface-container-highest/90 backdrop-blur-md rounded-full font-label-sm text-label-sm text-on-surface shadow-sm">
                    Monday: Stuffed Backpack & Cluttered Desk
                  </div>
                </div>

                {/* After Image with variable opacity */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
                  style={{
                    opacity: sliderValue / 100,
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnogDyQTAv4KXmRhIuGBEbueAYl7HnvjYo7Hx14dttjKKb32yDogLmIZsZD8MT1pUZCosmJ3kyWPIAvIz4_aFlUJOa4kPDS7qq7Li6-uCf_9H5ya_BYIqqO32KkZ5vbZcD9QRroJe_-qZy7nFXhhAW9buJTHj2aLsrOdspMzysqLmgbd-tGRvgLYaoPQ74KKlMAzrDZ2SynIlajpVMHbXonSJoBU0PBgfKpNnQqMhQyWNv2z9TENlP')",
                  }}
                >
                  <div className="absolute top-4 left-4 px-space-sm py-1 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm rounded-full shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">spa</span>
                    Sunday Now: Light, Airy & Restful
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm px-space-md py-space-xs rounded-full font-label-sm text-label-sm text-on-surface shadow-md">
                  Drag to view the room you created
                </div>
              </div>

              {/* Slider Controls */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl flex flex-col gap-space-xs shadow-sm">
                <div className="flex justify-between items-center font-label-md text-label-md text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-error">
                      work_history
                    </span>{' '}
                    Jam-Packed
                  </span>
                  <span className="text-primary font-bold">{getSliderLabel(sliderValue)}</span>
                  <span className="flex items-center gap-1">
                    Light & Ready{' '}
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      favorite
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full accent-primary h-2 bg-surface-container-highest rounded-lg cursor-pointer transition-all"
                />
              </div>
            </div>

            {/* Pax Note & Cognitive Load Index */}
            <div className="lg:col-span-5 flex flex-col gap-space-md">
              {/* Pax Speech Card */}
              <div className="relative bg-tertiary-fixed/30 p-space-lg rounded-xl shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="relative w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDowoE-ZrQlrWSfuYSqgwGZhBpdaYvBak2gSG7rw8jIkskWxR55Xl-_FfPFayffYNenyiBBE241sY1NIsicQDTbZcpbYqFwtvD7VNxm9WYgicwqfXuFtqwvZdhj7awA0C23rITDHVlVEIVk1FhGifAgpny08L1CRJ_2DH9sPJqxTZ5e1pR0AyVbgs7vo0PKQOPSmxzfwp0HL79HWjCdpZswJuydsPuZ7IDqm6Q-qUDs9UV6_aPnhUmp"
                      alt="Pax the friendly backpack companion"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-headline-sm text-headline-sm text-on-surface">Pax says:</div>
                    <div className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider">
                      Your Backpack Buddy
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative">
                  <div className="absolute -top-2 left-6 w-3 h-3 bg-surface-container-lowest transform rotate-45"></div>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    “Remember Monday morning when every syllabus line felt like a crisis? You handled 3
                    assignments, sorted your laundry, and gave yourself full permission to nap on
                    Friday.{' '}
                    <strong className="text-primary font-semibold">
                      That's not falling behind—that is genuine progress.
                    </strong>”
                  </p>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant font-label-md text-label-md pt-space-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      emoji_objects
                    </span>
                    Weekly Pace: Gentle
                  </span>
                  <button
                    onClick={handlePaxCheer}
                    className="text-primary font-label-md text-label-md hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    Thanks, Pax! ☕
                  </button>
                </div>

                {paxMessage && (
                  <div className="bg-primary-fixed text-on-primary-fixed-variant p-2 rounded-lg text-xs font-medium animate-pulse">
                    {paxMessage}
                  </div>
                )}
              </div>

              {/* Cognitive Load Index */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center text-secondary shrink-0">
                    <span className="material-symbols-outlined text-[20px]">self_improvement</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Cognitive Load Index
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Down from 'Stifled' to 'Breezy'
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-secondary-fixed/50 text-on-secondary-fixed px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Relaxed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reflection & Badges Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
          {/* Left Column: Weekly Journal Reflection */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[22px]">auto_stories</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Weekly Journal Reflection
              </h2>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant -mt-space-xs">
              No metrics, no performance reviews. Just an honest 2-minute breath for yourself before
              the next week turns the page.
            </p>

            <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-tertiary-fixed opacity-80 rounded-xs -rotate-1 pointer-events-none"></div>

              <div className="flex flex-col gap-space-xs">
                <label className="font-headline-sm text-headline-sm text-on-surface">
                  What felt lighter this week?
                </label>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Write freely. Spilling ink here keeps your backpack light.
                </span>
              </div>

              {/* Gentle Sparks Box */}
              <div className="bg-surface-container-low p-space-md rounded-lg flex flex-col gap-space-xs">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Gentle Sparks to consider:
                </div>
                <ul className="flex flex-col gap-1 text-on-surface-variant font-body-sm text-body-sm">
                  <li className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                    Which deadline felt like a boulder that turned out to be just a pebble?
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0"></span>
                    Did you remember to step outside, breathe, or close your laptop before 11 PM?
                  </li>
                  <li className="flex items-center gap-space-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0"></span>
                    What’s one thought you don't need to carry into tomorrow?
                  </li>
                </ul>
              </div>

              {/* Reflection Textarea */}
              <textarea
                rows={5}
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="My biology quiz turned out to be open book, so the three nights of dread were unnecessary. Felt really nice to sit in the courtyard on Thursday with no headphones..."
                className="w-full bg-surface-container-low/40 rounded-lg p-space-md font-body-md text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest placeholder:text-outline transition-all resize-none shadow-inner"
              />

              {/* Quick Tags & Save Action */}
              <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                <div className="flex items-center gap-space-xs">
                  <button
                    type="button"
                    onClick={() => handleTagClick('Slower Pace')}
                    className="px-space-sm py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    🌿 Slower Pace
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTagClick('Took Real Breaks')}
                    className="px-space-sm py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    ☕ Took Real Breaks
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTagClick('Let Things Go')}
                    className="px-space-sm py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm hover:scale-105 transition-transform cursor-pointer"
                  >
                    ✨ Let Things Go
                  </button>
                </div>

                <button
                  onClick={handleSaveReflection}
                  className="px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isSaved ? 'check' : 'bookmark_add'}
                  </span>
                  <span>{isSaved ? 'Saved!' : 'Save to My Journal'}</span>
                </button>
              </div>

              {isSaved && (
                <div className="font-label-md text-label-md text-secondary flex items-center gap-space-xs justify-center pt-2 animate-fade-in">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Saved in your private journal box. Deep breath taken.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Campground Badges */}
          <div className="lg:col-span-5 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-tertiary text-[22px]">military_tech</span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Campground Badges</h2>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">4 of 5 Unlocked</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant -mt-space-xs">
              Physical enamel pins for your canvas bag. Small reminders that surviving the week is an
              art form.
            </p>

            <div className="grid grid-cols-1 gap-space-sm">
              {/* Badge 1 */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">backpack</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      First Unpack
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                      Earned
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Took the courage to dump the initial mental clutter.
                  </p>
                </div>
              </div>

              {/* Badge 2 */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">eco</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      One Step at a Time
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                      Earned
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Finished your first 10-minute micro-action without rush.
                  </p>
                </div>
              </div>

              {/* Badge 3 */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">auto_awesome</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Made Some Room
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                      Earned
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Emptied 5 sticky burdens from your companion bag.
                  </p>
                </div>
              </div>

              {/* Badge 4 */}
              <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md hover:bg-surface-container-low transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed-dim/50 flex items-center justify-center text-primary shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[26px]">extension</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Small Wins
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm font-semibold shrink-0">
                      Earned
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Chose resting with music over exhausting doom-scrolling.
                  </p>
                </div>
              </div>

              {/* Badge 5 (In Progress) */}
              <div className="bg-surface-container-low/60 p-space-md rounded-xl flex items-center gap-space-md opacity-75 hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-outline shrink-0">
                  <span className="material-symbols-outlined text-[26px]">bedtime</span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-headline-sm text-on-surface truncate">
                      Off-Duty
                    </span>
                    <span className="px-space-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-medium shrink-0">
                      In Progress
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    Close all browser tabs before 11 PM tonight.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-surface-container-low p-space-lg rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-sm">
          <div className="flex items-center gap-space-md">
            <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
              <span className="material-symbols-outlined text-[24px]">coffee</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">
                Ready to start fresh tomorrow?
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Don't load up your bag all at once. Take Monday one slow step at a time.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <button className="w-full sm:w-auto text-center px-space-lg py-space-sm rounded-full bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-label-lg text-label-lg cursor-pointer">
              Browse Saved Entries
            </button>
            <Link
              to="/unpack"
              className="w-full sm:w-auto text-center px-space-lg py-space-sm rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all"
            >
              Unpack a New Thought
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

