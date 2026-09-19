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
        </section>
      </div>


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
