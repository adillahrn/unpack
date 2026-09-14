import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [sampleInput, setSampleInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const selectTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleMiniUnpack = () => {
    if (!sampleInput.trim()) {
      setSampleInput("Need to study for chem midterms, finish group deck, and get more sleep...");
    }
    setShowFeedback(true);
  };

  const tagPills = ['📚 Finals Panic', '😴 Sleep Deprived', '👥 Group Project Drag', '💸 Rent / Money'];

  return (
    <div className="flex flex-col w-full">

      {/* Top Decorative Ambient Glow */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-b from-primary-fixed/40 via-secondary-container/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        {/* HERO SECTION */}
        <section className="relative max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pt-8 pb-16 md:pt-14 md:pb-24">
          {/* Washi tape corner accents */}
          <div className="hidden sm:block absolute top-2 right-12 w-28 h-6 bg-tertiary-fixed/60 rotate-6 shadow-sm rounded-sm pointer-events-none backdrop-blur-[1px]"></div>
          <div className="hidden sm:block absolute top-6 left-8 w-24 h-5 bg-secondary-container/50 -rotate-3 shadow-sm rounded-sm pointer-events-none backdrop-blur-[1px]"></div>

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
            {/* Friendly Pill Badge */}
            <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container shadow-sm mb-6 transition-transform hover:scale-105">
              <span className="text-secondary text-[15px]">🌱</span>
              <span className="font-label-md text-label-md text-on-surface">A calmer digital companion for student life</span>
            </div>

            {/* Headline */}
            <h1 className="font-display-lg text-display-lg md:text-[54px] md:leading-[1.15] text-on-surface tracking-tight mb-6">
              You don't have to carry it{' '}
              <span className="relative inline-block text-primary">
                all at once
                <svg className="absolute -bottom-2.5 left-0 w-full text-secondary-container" fill="none" height="12" viewBox="0 0 240 14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 10.5C65 3.5 165 2.5 237 8" stroke="currentColor" strokeLinecap="round" strokeWidth="5" />
                </svg>
              </span>.
            </h1>

            {/* Supporting text */}
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-8">
              UNPACK helps university students turn everything buzzing in their mind into a clearer, lighter next step. Less mental weight, more breathing room.
            </p>

            {/* CTA cluster */}
            <div className="flex flex-wrap items-center justify-center gap-space-md w-full sm:w-auto">
              <Link
                to="#mind-dump"
                className="inline-flex items-center justify-center gap-space-xs px-space-xl py-3.5 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_4px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_3px_0_#5516be] active:translate-y-[4px] active:shadow-none transition-all"
                onClick={(e) => { e.preventDefault(); document.getElementById('mind-dump')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span>Unpack your mind</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="#how-it-works"
                className="inline-flex items-center justify-center gap-space-xs px-space-lg py-3.5 rounded-full bg-surface-container text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface-container-high transition-all"
                onClick={(e) => { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span>See how it works</span>
                <span>🎒</span>
              </Link>
            </div>
          </div>

          {/* HERO VISUAL SHOWCASE */}
          <div className="relative w-full max-w-4xl mx-auto mt-6">
            <div className="relative rounded-3xl bg-surface-container-low p-6 sm:p-10 shadow-xl overflow-visible">
              {/* Dot grid pattern */}
              <div className="absolute inset-0 opacity-25 pointer-events-none rounded-3xl" style={{ backgroundImage: 'radial-gradient(#7b7486 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              {/* Washi tape */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-7 bg-tertiary-fixed-dim/45 rotate-1 rounded-sm shadow-sm pointer-events-none"></div>

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Pax and Backpack */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                    <div className="absolute w-56 h-56 rounded-full bg-primary-fixed/50 blur-2xl"></div>
                    <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-lg transform -rotate-1 transition-transform hover:rotate-0">
                      <img
                        className="w-full h-full object-cover"
                        alt="Charming warm photography of an overloaded student canvas backpack"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAg6F9O7ICCE7hITIPEjrgfb9cWl6i7s_yPTOrtM25R8ojp9rOGrhFh639ShQ7CdbG-c5QpCy0UBiixcKfCh-ySWqNPKA0gHMtS9C8uvGYFgVwiL6deolSFDdjx_MFh6rmKGSCsjadHaQXJhosmMY6OqRL9wCDkPHLJ10QCGWBLt4KKfkI7fcrMLQuHqFcRvPpJb2ALTQ3NFu1_Hwih7XWAym8nWGUE5Unus8lWzE29FjboWqnYS_tt"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/40 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 bg-primary-container text-on-primary-container px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
                        <span>Pax is listening</span>
                      </div>
                    </div>
                    {/* Pax Speech Bubble */}
                    <div className="absolute -bottom-5 -right-2 sm:-right-6 bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-2xl rounded-bl-sm shadow-xl max-w-[240px] transform rotate-2 animate-bounce hover:animate-none" style={{ animationDuration: '4s' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🎒</span>
                        <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-tertiary-fixed-variant">Pax says</span>
                      </div>
                      <p className="font-body-sm text-body-sm font-semibold leading-snug">
                        "Whoa… that's a lot to carry in one head. Let's unpack it together!"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: Floating Baggage Tags */}
                <div className="lg:col-span-6 flex flex-col gap-3">
                  <div className="text-left mb-1">
                    <span className="font-label-sm text-label-sm uppercase text-on-surface-variant tracking-wider">Unpacked clutter items</span>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">Things currently cluttering the brain:</h3>
                  </div>

                  {/* Baggage Item 1 */}
                  <div className="group flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transform -rotate-1 hover:rotate-0 transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-error-container text-on-error-container text-lg">📚</span>
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface leading-tight">Algorithm Assignment</p>
                        <span className="font-label-sm text-label-sm text-error">35% grade • Due Friday midnight</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-error-container/60 text-error font-label-sm text-label-sm font-bold">Urgent</span>
                  </div>

                  {/* Baggage Item 2 */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transform rotate-1 hover:rotate-0 transition-all cursor-default">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed text-lg">📅</span>
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface leading-tight">UTS Exam Prep &amp; Notes</p>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">3 lectures behind on Week 8</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-tertiary-fixed/60 text-tertiary font-label-sm text-label-sm">Academic</span>
                  </div>

                  {/* Baggage Item 3 */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md transform hover:rotate-0 transition-all cursor-default" style={{ transform: 'rotate(-0.5deg)' }}>
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container text-lg">🎤</span>
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface leading-tight">Group presentation slides</p>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Half-done • Waiting on Alex</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-label-sm">Teamwork</span>
                  </div>

                  {/* Small items row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transform rotate-1 hover:rotate-0 transition-all">
                      <span className="text-base">💬</span>
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate">Group chat (14 unread)</p>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Social noise</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container-lowest shadow-sm flex items-center gap-2.5 transform -rotate-1 hover:rotate-0 transition-all">
                      <span className="text-base">💤</span>
                      <div className="min-w-0">
                        <p className="font-label-md text-label-md text-on-surface truncate">Skipped lunch fatigue</p>
                        <span className="font-label-sm text-label-sm text-error">Low battery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* PROBLEM SECTION: "The Backpack Comparison" */}
      <section className="w-full bg-surface-container-low py-16 md:py-24">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
              <span>The Overload Reality</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg md:text-[36px] md:leading-tight text-on-surface mb-4">
              Your mind doesn't have a <span className="text-primary underline decoration-secondary-container decoration-4">close-all-tabs</span> button.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Between lectures, deadlines, social plans, and self-doubt, cognitive load stacks up fast until even choosing what to do first feels paralyzing.
            </p>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-desktop items-stretch">
            {/* BEFORE */}
            <div className="relative rounded-3xl bg-surface p-6 md:p-8 shadow-md flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-10 w-24 h-4 bg-error-container/60 -rotate-2 rounded-b-sm"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-error-container text-error text-xl">⚠️</span>
                    <div>
                      <span className="font-label-sm text-label-sm uppercase text-error font-bold tracking-wide">Before UNPACK</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">The Heavy Backpack</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-md text-label-md font-bold">Stress 94%</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Messy mental pile, unfinished thoughts colliding, tabs opening faster than you can read, constant vague guilt about what you're forgetting.
                </p>
                <div className="relative p-5 rounded-2xl bg-surface-container min-h-[220px] flex flex-col justify-center gap-3">
                  <div className="p-3 bg-surface rounded-lg shadow-sm transform -rotate-2">
                    <p className="font-label-md text-label-md text-on-surface line-through text-outline">Reply to Professor Collins</p>
                    <span className="font-label-sm text-label-sm text-error">Overdue by 2 days • Forgot attachment</span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg shadow-sm transform rotate-3 ml-6">
                    <p className="font-label-md text-label-md text-on-surface">Buy groceries? Or order takeout again?</p>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Fridge has half a lime and iced coffee</span>
                  </div>
                  <div className="p-3 bg-surface rounded-lg shadow-sm transform -rotate-1 mr-4">
                    <p className="font-label-md text-label-md text-on-surface">Did I register for Friday lab session?</p>
                    <span className="font-label-sm text-label-sm text-error">Portal was down at 2am</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-error font-label-sm text-label-sm">Mental Overload Meter</span>
                  <span className="text-error font-label-sm text-label-sm">94% Over Capacity</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-error rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="relative rounded-3xl bg-surface p-6 md:p-8 shadow-xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-10 w-28 h-4 bg-secondary-container/80 rotate-1 rounded-b-sm"></div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container text-xl">🌿</span>
                    <div>
                      <span className="font-label-sm text-label-sm uppercase text-secondary font-bold tracking-wide">With UNPACK</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Organized Breathing Room</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md font-bold">Stress 24%</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                  Sorted into gentle compartments. One single task at a time. No overwhelming checklists, just one clear 10-minute micro-step.
                </p>
                <div className="p-5 rounded-2xl bg-surface-container min-h-[220px] flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Only Next Step: Open Google Doc</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm">10 min</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface flex items-center justify-between">
                      <span className="text-on-surface-variant">Academic Pouch</span>
                      <span className="font-bold text-on-surface">3 sorted</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface flex items-center justify-between">
                      <span className="text-on-surface-variant">Social Pouch</span>
                      <span className="font-bold text-on-surface">Parked</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary-container/30 flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    <p className="font-body-sm text-body-sm text-secondary font-medium">
                      "You have 4 hours before club meeting. Rest first, you've earned lunch."
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4">
                <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                  <span className="text-secondary font-label-sm text-label-sm">Mental Clarity Meter</span>
                  <span className="text-secondary font-label-sm text-label-sm">Calm &amp; Focused</span>
                </div>
                <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wider mb-3">
            <span>Gentle 4-Step Flow</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg md:text-[36px] md:leading-tight text-on-surface mb-4">
            Unpacking your mind in four easy breaths.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            No complicated productivity frameworks. Pax sits beside you and helps guide the clutter into clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { step: '01', badge: 'bg-tertiary-fixed text-on-tertiary-fixed', icon: '📝', iconBg: 'bg-surface-container', title: 'The Mind Dump', desc: "Put everything on your mind into one place. Bullet points, half-sentences, panic notes. No formatting, no filters.", pax: '🎒', paxText: 'Pax sits on the notebook ready to catch it all.' },
            { step: '02', badge: 'bg-primary-fixed text-on-primary-fixed', icon: '🗂️', iconBg: 'bg-primary-fixed/40', title: 'Pockets & Bags', desc: "UNPACK sorts the clutter into clear baggage cards by urgency, energy needed, and whether it even belongs to you.", pax: '✨', paxText: 'Pax unzips your compartmentalized pouches.' },
            { step: '03', badge: 'bg-secondary-container text-on-secondary-container', icon: '✏️', iconBg: 'bg-secondary-container/40', title: 'The Micro-Action', desc: "Choose one single 10-minute micro-action to break the paralysis. Not the whole 2,000-word essay, just the outline title.", pax: '💡', paxText: 'Pax hands you a single glowing pencil.' },
            { step: '04', badge: 'bg-tertiary-fixed-dim text-on-tertiary-fixed', icon: '🎈', iconBg: 'bg-tertiary-fixed/40', title: 'Feel the Lightness', desc: "Mark it done, earn a gentle badge token, and physically watch the backpack on screen lose weight and breathe.", pax: '🎉', paxText: 'Pax floats happily with warm star sparkles.' },
          ].map((s) => (
            <div key={s.step} className="relative group rounded-3xl bg-surface-container-lowest p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div className={`absolute -top-3 left-6 px-3 py-0.5 rounded-full ${s.badge} font-label-sm text-label-sm font-extrabold shadow-sm`}>
                STEP {s.step}
              </div>
              <div className="pt-3">
                <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{s.title}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">{s.desc}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-2">
                <span className="text-base">{s.pax}</span>
                <span className="italic font-label-sm text-label-sm">{s.paxText}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTERACTIVE SANDBOX */}
      <section className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop pb-16" id="mind-dump">
        <div className="rounded-3xl bg-surface-container p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute -top-2 right-16 w-32 h-6 bg-tertiary-fixed/70 -rotate-2 rounded-sm shadow-xs"></div>

          <div className="max-w-2xl mx-auto text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-primary font-label-sm text-label-sm uppercase font-bold tracking-wider mb-3">
              <span>Instant Interactive Sandbox</span>
            </div>
            <h3 className="font-headline-md text-headline-md sm:text-[30px] text-on-surface mb-2">
              Drop one heavy thought right here.
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Type whatever is sitting in the back of your neck right now. We won't save it to a database until you want to.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-md">
            <textarea
              className="w-full p-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition-all"
              placeholder="e.g. My neuroscience lab report is due tomorrow and I still haven't run the script..."
              rows={3}
              value={sampleInput}
              onChange={(e) => { setSampleInput(e.target.value); setShowFeedback(false); }}
            />

            <div className="flex flex-wrap items-center gap-2 my-4">
              <span className="font-label-sm text-label-sm text-on-surface-variant mr-1">Feels like:</span>
              {tagPills.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => selectTag(tag)}
                  className={`px-3 py-1 rounded-full font-label-sm text-label-sm transition-all ${
                    selectedTags.has(tag)
                      ? 'bg-primary-container text-on-primary-container shadow-xs'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">100% private sandbox</span>
              </div>
              <button
                onClick={handleMiniUnpack}
                className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-[0_3px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_2px_0_#5516be] active:translate-y-[3px] active:shadow-none transition-all flex items-center gap-1.5"
              >
                <span>Sort into pocket</span>
                <span className="material-symbols-outlined text-[16px]">folder_zip</span>
              </button>
            </div>

            {showFeedback && (
              <div className="mt-4 p-4 rounded-xl bg-secondary-container/40 text-on-surface animate-[fade-in_0.3s_ease-out]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <p className="font-label-md text-label-md font-bold text-secondary">Pax unpacked this for you:</p>
                    <p className="font-body-sm text-body-sm text-on-surface mt-1">"Breathe. Don't worry about the entire report right now. Your only 10-minute micro-step: Open the file and write the title heading. That's all for now."</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STUDENT STORIES */}
      <section className="w-full bg-surface-container-low py-16 md:py-24">
        <div className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">From student desks across campus</span>
            <h2 className="font-headline-lg text-headline-lg md:text-[36px] text-on-surface mt-2 mb-3">
              Made by students who were tired of feeling like failed machines.
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              You don't need another sterile enterprise kanban board. You need a gentle companion that understands 11:59 PM deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {[
              { tape: 'bg-tertiary-fixed/60 rotate-2', stars: 'text-tertiary', quote: '"UNPACK feels like taking off a heavy, soaking wet winter coat after walking all the way across campus in the freezing rain."', initial: 'M', initBg: 'bg-primary-fixed text-on-primary-fixed', name: 'Maya L.', role: '2nd Year Computer Science • UTS' },
              { tape: 'bg-secondary-container/60 -rotate-1', stars: 'text-secondary', quote: '"Not another corporate productivity tool built for Fortune 500 managers. It actually feels kind of like a reassuring friend sitting at my desk."', initial: 'L', initBg: 'bg-secondary-container text-on-secondary-container', name: 'Leo K.', role: 'Architecture Major • Year 3' },
              { tape: 'bg-primary-fixed/60 rotate-1', stars: 'text-primary', quote: '"The \'Start Here\' 10-minute micro step is the only thing that cured my freeze response during midterms. It broke the mental boulder into pebbles."', initial: 'S', initBg: 'bg-tertiary-fixed text-on-tertiary-fixed', name: 'Samantha V.', role: 'Pre-Med & Psychology • Senior' },
            ].map((t, i) => (
              <div key={i} className="relative rounded-3xl bg-surface p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className={`absolute -top-2 left-8 w-20 h-4 ${t.tape} rounded-sm`}></div>
                <div>
                  <div className={`flex items-center gap-1 ${t.stars} mb-3`}>
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface italic mb-6">{t.quote}</p>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <div className={`w-10 h-10 rounded-full ${t.initBg} flex items-center justify-center font-bold`}>{t.initial}</div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-semibold">{t.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Campus photo highlight */}
          <div className="mt-12 rounded-3xl bg-surface p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 h-56 rounded-2xl overflow-hidden shadow-inner">
              <img
                className="w-full h-full object-cover"
                alt="University campus coffee shop study setting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPPqhEmq3jhsxeixo5KY6RrU7xw-T_T-VneotFaG520jgakDImLRl556ZDbcVqpGpFVi6Pgg3Tl5LZudfvhSn0pPmTvzkSBatG-8zzlqC2t4F-YiSHEUrYAlMdfoZZ11QPggNjSO9dgEz_1bDVVgTGWENj2dUF9P5Pb3Hl7eChgsV9Cl2Afi1JVof75JkGATtiYhfU91oLFMoU-aBUEAJuUJtJFl0dJtjbJH6w1mbLspMC9ESA5Vaa"
              />
            </div>
            <div className="md:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/40 text-secondary font-label-sm text-label-sm w-fit mb-3">
                <span>Free for campus students</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">No paywalls for university domains.</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                Sign up with your university email (.edu, .ac.uk, .edu.au) and unlock all backpack pockets, calming audio soundscapes, and Pax companion prompts for free.
              </p>
              <div className="flex items-center gap-4 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span> No credit card</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span> Zero spam</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span> Built for real students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLOSING CALLOUT */}
      <section className="max-w-[1180px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-16 md:py-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary-fixed via-surface-container to-secondary-container/40 p-8 sm:p-14 shadow-xl overflow-hidden text-center">
          <div className="absolute -top-3 left-1/4 w-32 h-7 bg-surface/70 rotate-2 rounded-sm shadow-xs"></div>
          <div className="absolute -top-3 right-1/4 w-32 h-7 bg-surface/70 -rotate-2 rounded-sm shadow-xs"></div>

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center text-3xl shadow-lg mb-6 transform -rotate-3 hover:rotate-0 transition-transform">
              🎒
            </div>
            <h2 className="font-display-lg text-display-lg md:text-[44px] text-on-surface mb-4">
              Ready to put down what you've been carrying?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
              Take five quiet minutes right now. Empty the mental backpack onto the table and let's see what is actually worth picking back up.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-md">
              <Link
                to="#mind-dump"
                className="inline-flex items-center justify-center gap-space-xs px-space-xl py-4 rounded-full bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_4px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_3px_0_#5516be] active:translate-y-[4px] active:shadow-none transition-all"
                onClick={(e) => { e.preventDefault(); document.getElementById('mind-dump')?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <span>Start Your First Mind Dump</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </Link>
              <button className="inline-flex items-center justify-center gap-space-xs px-space-lg py-4 rounded-full bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-sm hover:bg-surface transition-all" type="button">
                <span>Join Student Discord 💬</span>
              </button>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-6">
              Always calm • Never algorithmic • Made with care for university students
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
