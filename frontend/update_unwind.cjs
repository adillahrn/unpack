const fs = require('fs');

let content = fs.readFileSync('src/pages/Unwind.tsx', 'utf8');

// Update useTranslation usage if needed
if (!content.includes('useTranslation')) {
    content = content.replace(
        "import { Link } from 'react-router-dom';",
        "import { Link } from 'react-router-dom';\nimport { useTranslation } from '@/i18n';"
    );
}

// Ensure the `Unwind` component has `const { t } = useTranslation();`
content = content.replace(
    /export default function Unwind\(\) {/,
    'export default function Unwind() {\n  const { t } = useTranslation();'
);

// We need to pass t to BubbleModal, BreatheModal, RainModal, FloatModal, PlantModal, ActionModal
// Or better, use useTranslation inside them.
const addTranslationHook = (componentName) => {
    const regex = new RegExp(`function ${componentName}\\((.*?)\\) \\{`);
    content = content.replace(regex, `function ${componentName}($1) {\n  const { t } = useTranslation();`);
};

addTranslationHook('BubbleModal');
addTranslationHook('BreatheModal');
addTranslationHook('RainModal');
addTranslationHook('FloatModal');
addTranslationHook('PlantModal');
addTranslationHook('ActionModal');


const replacements = [
    [
        /<span className="px-3 py-1 rounded-full bg-primary-fixed\/60 text-on-primary-fixed font-label-sm text-\[12px\] uppercase tracking-wider">Tactile calm<\/span>/g,
        '<span className="px-3 py-1 rounded-full bg-primary-fixed/60 text-on-primary-fixed font-label-sm text-[12px] uppercase tracking-wider">{t(\'unwind.bubble.tag\')}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Pop a few.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.bubble.heading\')}</h3>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant">Let your mind slow down with each pop.<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant">{t(\'unwind.bubble.subheading\')}</p>'
    ],
    [
        /Popped: /g,
        '{t(\'unwind.bubble.popped\')} '
    ],
    [
        /\{'\\u\{2728\}'\} A little quieter\./g,
        '{t(\'unwind.bubble.quieter\')}'
    ],
    [
        /<span className="px-3 py-1 rounded-full bg-\[#e0f2fe\] text-\[#0369a1\] font-label-sm text-\[12px\] uppercase tracking-wider">4-4-4 rhythm<\/span>/g,
        '<span className="px-3 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] font-label-sm text-[12px] uppercase tracking-wider">{t(\'unwind.breathe.tag\')}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Take a breath.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.breathe.heading\')}</h3>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant">Just for a minute.<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant">{t(\'unwind.breathe.subheading\')}</p>'
    ],
    [
        />Done \{'\\u\{2713\}'\}<\/span>/g,
        '>{t(\'unwind.breathe.done\')}</span>'
    ],
    [
        /running \? `\$\{count\}s` : 'Paused'/g,
        'running ? `${count}s` : t(\'unwind.breathe.paused\')'
    ],
    [
        /done \? '"A little slower. A little lighter."' : `\$\{fmt\(remaining\)\} remaining`/g,
        'done ? t(\'unwind.breathe.doneQuote\') : `${fmt(remaining)} ${t(\'unwind.breathe.remaining\')}`'
    ],
    [
        /\{done \? 'Again' : running \? 'Pause' : 'Resume'\}/g,
        '{done ? t(\'unwind.breathe.again\') : running ? t(\'unwind.pause\') : t(\'unwind.resume\')}'
    ],
    [
        /<span className="px-3 py-1 rounded-full bg-secondary-container\/70 text-on-secondary-container font-label-sm text-\[12px\] uppercase tracking-wider">Focus ease<\/span>/g,
        '<span className="px-3 py-1 rounded-full bg-secondary-container/70 text-on-secondary-container font-label-sm text-[12px] uppercase tracking-wider">{t(\'unwind.rain.tag\')}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Follow one drop.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.rain.heading\')}</h3>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant">Nothing else for a moment.<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant">{t(\'unwind.rain.subheading\')}</p>'
    ],
    [
        /You were here for a moment. That's enough./g,
        '{t(\'unwind.rain.done\')}'
    ],
    [
        /Move your cursor over the window to generate soft ripples./g,
        '{t(\'unwind.rain.cursorHint\')}'
    ],
    [
        /<span className="px-3 py-1 rounded-full bg-\[#ffedd5\] text-\[#9a3412\] font-label-sm text-\[12px\] uppercase tracking-wider">Mental unburden<\/span>/g,
        '<span className="px-3 py-1 rounded-full bg-[#ffedd5] text-[#9a3412] font-label-sm text-[12px] uppercase tracking-wider">{t(\'unwind.float.tag\')}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">Put one thought down.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.float.heading\')}</h3>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant">You don't have to solve it right now.<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant">{t(\'unwind.float.subheading\')}</p>'
    ],
    [
        /Write one nagging thought below, then release it into the open sky./g,
        '{t(\'unwind.float.prompt\')}'
    ],
    [
        />You don't have to solve this right now.<\/p>/g,
        '>{t(\'unwind.float.releasedTitle\')}</p>'
    ],
    [
        />"Releasing attention for now. You can come back to this later."<\/p>/g,
        '>{t(\'unwind.float.releasedDesc\')}</p>'
    ],
    [
        /placeholder="What's on your mind\? \(e.g. I'm worried about presentation\)"/g,
        'placeholder={t(\'unwind.float.placeholder\')}'
    ],
    [
        /Let it float \{'\\u\{1F388\}'\}/g,
        '{t(\'unwind.float.button\')}'
    ],
    [
        /<span className="px-3 py-1 rounded-full bg-tertiary-fixed\/70 text-on-tertiary-fixed font-label-sm text-\[12px\] uppercase tracking-wider">Nurture<\/span>/g,
        '<span className="px-3 py-1 rounded-full bg-tertiary-fixed/70 text-on-tertiary-fixed font-label-sm text-[12px] uppercase tracking-wider">{t(\'unwind.plant.tag\')}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">A tiny act of care.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.plant.heading\')}</h3>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant">Small care still counts.<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant">{t(\'unwind.plant.subheading\')}</p>'
    ],
    [
        /const \[feedback, setFeedback\] = useState\('Sprout is resting peacefully.'\);/g,
        'const [feedback, setFeedback] = useState(\'unwind.plant.resting\');'
    ],
    [
        /setFeedback\(\n      next >= 3\n        \? 'Fully bloomed! Small care still counts. \\u\{2728\}'\n        : type === 'water'\n        \? 'The soil soaked it in gently. \\u\{1F4A7\}'\n        : "A warm ray. It's growing. \\u\{2600\}\\u\{FE0F\}"\n    \);/g,
        'setFeedback(\n      next >= 3\n        ? \'unwind.plant.bloomed\'\n        : type === \'water\'\n        ? \'unwind.plant.watered\'\n        : \'unwind.plant.sunned\'\n    );'
    ],
    [
        /\{feedback\}/g,
        '{t(feedback)}'
    ],
    [
        />Water Plant<\/span>/g,
        '>{t(\'unwind.plant.waterBtn\')}</span>'
    ],
    [
        />Give Sunlight<\/span>/g,
        '>{t(\'unwind.plant.sunBtn\')}</span>'
    ],
    [
        />\s*\{ms.duration\}-Minute Protected Sprint\s*<\/span>/g,
        '>{t(\'unwind.action.sprint\').replace(\'{duration}\', ms.duration.toString())}</span>'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">One thing. That's all.<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface mt-2">{t(\'unwind.action.oneThingTitle\')}</h3>'
    ],
    [
        /<div className="font-label-sm text-label-sm text-on-surface-variant mt-1">Focus window \{running \? 'running' : 'paused'\}<\/div>/g,
        '<div className="font-label-sm text-label-sm text-on-surface-variant mt-1">{running ? t(\'unwind.action.focusRunning\') : t(\'unwind.action.focusPaused\')}</div>'
    ],
    [
        />\s*"I'll stay right here. You don't need to think about the next thing yet."\s*<\/p>/g,
        '>{t(\'unwind.action.paxQuote\')}</p>'
    ],
    [
        /\{running \? 'Pause' : 'Resume'\}/g,
        '{running ? t(\'unwind.pause\') : t(\'unwind.resume\')}'
    ],
    [
        /Finish Early/g,
        '{t(\'unwind.action.finishEarly\')}'
    ],
    [
        /<h3 className="font-headline-lg text-headline-lg text-on-surface">That's enough for now. \{'\\u\{2713\}'\}<\/h3>/g,
        '<h3 className="font-headline-lg text-headline-lg text-on-surface">{t(\'unwind.action.doneTitle\')}</h3>'
    ],
    [
        /You gave "\{item.title\}" a few quiet minutes. It's saved as in progress in My Bag./g,
        '{t(\'unwind.action.doneDesc\').replace(\'{title}\', item.title)}'
    ],
    [
        /Mental Weight/g,
        '{t(\'unwind.action.mentalWeight\')}'
    ],
    [
        />Before<\/p>/g,
        '>{t(\'unwind.action.before\')}</p>'
    ],
    [
        />After<\/p>/g,
        '>{t(\'unwind.action.after\')}</p>'
    ],
    [
        />Lighter<\/p>/g,
        '>{t(\'unwind.action.lighter\')}</p>'
    ],
    [
        /\(A playful metaphor, not a measurement.\)/g,
        '{t(\'unwind.action.metaphor\')}'
    ],
    [
        /\{saving \? 'Saving\.\.\.' : 'Mark as done'\}/g,
        '{saving ? t(\'unwind.action.saving\') : t(\'unwind.action.markDone\')}'
    ],
    [
        /Back to My Bag/g,
        '{t(\'unwind.action.backToBag\')}'
    ],
    [
        /Unwind longer/g,
        '{t(\'unwind.action.unwindLonger\')}'
    ],
    [
        /const wLabel = item.urgency === 'high' \? 'Heavy' : item.urgency === 'medium' \? 'Moderate' : 'Light';/g,
        'const wLabel = item.urgency === \'high\' ? t(\'unwind.action.weightHeavy\') : item.urgency === \'medium\' ? t(\'unwind.action.weightModerate\') : t(\'unwind.action.weightLight\');'
    ],
    [
        /<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">\s*You can pause here or start here\.\s*<\/h1>/g,
        '<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface tracking-tight">\\n                  {t(\'unwind.heroTitle\')}\\n                </h1>'
    ],
    [
        /<p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl">\s*Nothing needs to be solved right now. Give your nervous system two quiet minutes before carrying anything else.\s*<\/p>/g,
        '<p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-xl">\\n                  {t(\'unwind.heroDesc\')}\\n                </p>'
    ],
    [
        /label: '0% expectation'/g,
        'label: t(\'unwind.heroPill1\')'
    ],
    [
        /label: 'Pick any drawer'/g,
        'label: t(\'unwind.heroPill2\')'
    ],
    [
        /label: 'Stay as long as needed'/g,
        'label: t(\'unwind.heroPill3\')'
    ],
    [
        /<h2 className="font-headline-lg text-headline-lg text-on-surface">🌱 One Small Pebble<\/h2>/g,
        '<h2 className="font-headline-lg text-headline-lg text-on-surface">{t(\'unwind.smallPebbleTitle\')}</h2>'
    ],
    [
        /<p className="font-body-md text-body-md text-on-surface-variant mt-1">\s*Before you unwind, take care of just one thing. Pick the top pebble from your bag and give it a gentle, frictionless start.\s*<\/p>/g,
        '<p className="font-body-md text-body-md text-on-surface-variant mt-1">\\n                {t(\'unwind.smallPebbleDesc\')}\\n              </p>'
    ],
    [
        /Loading your bag…/g,
        '{t(\'unwind.loadingBag\')}'
    ],
    [
        /<h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Your bag is empty<\/h3>\s*<p className="text-body-md text-on-surface-variant max-w-md mx-auto">\s*Head to Unpack to dump your thoughts and sort them into pebbles first. Then come back here to start chipping away.\s*<\/p>/g,
        '<h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{t(\'unwind.emptyBagTitle\')}</h3>\\n                <p className="text-body-md text-on-surface-variant max-w-md mx-auto">\\n                  {t(\'unwind.emptyBagDesc\')}\\n                </p>'
    ],
    [
        /Today's Single Pebble/g,
        '{t(\'unwind.todaysPebble\')}'
    ],
    [
        /Estimated effort: \{ms.duration\} minutes • Low friction/g,
        '{t(\'unwind.estimatedEffort\').replace(\'{duration}\', ms.duration.toString())}'
    ],
    [
        /Begin Softly/g,
        '{t(\'unwind.beginSoftly\')}'
    ],
    [
        /Next tiny move:/g,
        '{t(\'unwind.nextTinyMove\')}'
    ],
    [
        /\{CATEGORY_EMOJI\[bagItem.category\] \?\? '📌'\} \{itemIndex \+ 1\} of \{items.length\} pebbles/g,
        '{CATEGORY_EMOJI[bagItem.category] ?? \'📌\'} {itemIndex + 1} {t(\'unwind.pebbleOf\')} {items.length} {t(\'unwind.pebbles\')}'
    ],
    [
        /<h2 className="font-headline-lg text-headline-lg text-on-surface">\{'\\u\{2728\}'\} Quick Resets<\/h2>\s*<p className="font-body-md text-body-md text-on-surface-variant mt-1">\s*A minute or two. That's all. Gentle interactive tactile micro-tools.\s*<\/p>/g,
        '<h2 className="font-headline-lg text-headline-lg text-on-surface">{t(\'unwind.quickResetsTitle\')}</h2>\\n                <p className="font-body-md text-body-md text-on-surface-variant mt-1">\\n                  {t(\'unwind.quickResetsDesc\')}\\n                </p>'
    ],
    [
        />Tap any card to open quiet room<\/span>/g,
        '>{t(\'unwind.quickResetsTip\')}</span>'
    ],
    [
        /<h2 className="font-headline-lg text-headline-lg text-on-surface">\{'\\u\{1F3A7\}'\} Sound<\/h2>\s*<p className="font-body-md text-body-md text-on-surface-variant mt-1">\s*Let something softer fill the room. Looped serene audio textures.\s*<\/p>/g,
        '<h2 className="font-headline-lg text-headline-lg text-on-surface">{t(\'unwind.soundTitle\')}</h2>\\n              <p className="font-body-md text-body-md text-on-surface-variant mt-1">\\n                {t(\'unwind.soundDesc\')}\\n              </p>'
    ],
    [
        /Now Playing/g,
        '{t(\'unwind.nowPlaying\')}'
    ],
    [
        /\{playing \? 'Active' : 'Paused'\}/g,
        '{playing ? t(\'unwind.active\') : t(\'unwind.paused\')}'
    ],
    [
        /\{playing \? 'Pause' : 'Play'\}/g,
        '{playing ? t(\'unwind.pause\') : t(\'unwind.play\')}'
    ],
    [
        /<h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">A note from Pax<\/h3>\s*<p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">\s*"You don't have to do everything today. Sometimes the bravest thing you can do is just sit here and breathe.\n                  I'm proud of you for showing up. Take your time — I'll be right here."\s*<\/p>/g,
        '<h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">{t(\'unwind.paxNoteTitle\')}</h3>\\n                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">\\n                  {t(\'unwind.paxNoteBody\')}\\n                </p>'
    ],
    [
        /\{ id: 'bubble'  as const, icon: 'bubble_chart', iconBg: 'bg-primary-fixed text-primary',      tagBg: 'bg-primary-fixed\/60 text-on-primary-fixed-variant',      tag: 'Tactile calm · ~1 min',   title: 'Pop Bubbles',     desc: 'Pop a few. Let your mind slow down.',              cta: 'Start popping',   ctaColor: 'text-primary' \},/g,
        '{ id: \'bubble\'  as const, icon: \'bubble_chart\', iconBg: \'bg-primary-fixed text-primary\',      tagBg: \'bg-primary-fixed/60 text-on-primary-fixed-variant\',      tag: \'unwind.resetCard.bubbleTag\',   title: \'unwind.resetCard.bubbleTitle\',     desc: \'unwind.resetCard.bubbleDesc\',              cta: \'unwind.resetCard.bubbleCta\',   ctaColor: \'text-primary\' },'
    ],
    [
        /\{ id: 'breathe' as const, icon: 'air',          iconBg: 'bg-\[#e0f2fe\] text-\[#0284c7\]',        tagBg: 'bg-\[#e0f2fe\] text-\[#0369a1\]',                            tag: '4-4-4 rhythm · 1-5 min',  title: 'Breathe',         desc: 'A 60-second gentle breathing reset.',              cta: 'Sync breath',     ctaColor: 'text-\[#0284c7\]' \},/g,
        '{ id: \'breathe\' as const, icon: \'air\',          iconBg: \'bg-[#e0f2fe] text-[#0284c7]\',        tagBg: \'bg-[#e0f2fe] text-[#0369a1]\',                            tag: \'unwind.resetCard.breatheTag\',  title: \'unwind.resetCard.breatheTitle\',         desc: \'unwind.resetCard.breatheDesc\',              cta: \'unwind.resetCard.breatheCta\',     ctaColor: \'text-[#0284c7]\' },'
    ],
    [
        /\{ id: 'rain'    as const, icon: 'water_drop',   iconBg: 'bg-secondary-fixed text-secondary',  tagBg: 'bg-secondary-container\/70 text-on-secondary-container',  tag: 'Focus ease · ~2 min',     title: 'Follow the Rain', desc: 'Follow one drop. Nothing else for a moment.',      cta: 'Watch drop',      ctaColor: 'text-secondary' \},/g,
        '{ id: \'rain\'    as const, icon: \'water_drop\',   iconBg: \'bg-secondary-fixed text-secondary\',  tagBg: \'bg-secondary-container/70 text-on-secondary-container\',  tag: \'unwind.resetCard.rainTag\',     title: \'unwind.resetCard.rainTitle\', desc: \'unwind.resetCard.rainDesc\',      cta: \'unwind.resetCard.rainCta\',      ctaColor: \'text-secondary\' },'
    ],
    [
        /\{ id: 'float'   as const, icon: 'paragliding',  iconBg: 'bg-\[#fed7aa\] text-\[#c2410c\]',        tagBg: 'bg-\[#ffedd5\] text-\[#9a3412\]',                            tag: 'Mental unburden · 2 min', title: 'Let It Float',    desc: 'Put one thought down for now without fixing it.',  cta: 'Release thought', ctaColor: 'text-\[#c2410c\]' \},/g,
        '{ id: \'float\'   as const, icon: \'paragliding\',  iconBg: \'bg-[#fed7aa] text-[#c2410c]\',        tagBg: \'bg-[#ffedd5] text-[#9a3412]\',                            tag: \'unwind.resetCard.floatTag\', title: \'unwind.resetCard.floatTitle\',    desc: \'unwind.resetCard.floatDesc\',  cta: \'unwind.resetCard.floatCta\', ctaColor: \'text-[#c2410c]\' },'
    ],
    [
        /\{ id: 'plant'   as const, icon: 'potted_plant', iconBg: 'bg-tertiary-fixed text-tertiary',    tagBg: 'bg-tertiary-fixed\/60 text-on-tertiary-fixed',            tag: 'Nurture · 1 min',         title: 'Water the Plant', desc: 'A tiny act of care. Small care still counts.',     cta: 'Tend sprout',     ctaColor: 'text-tertiary' \},/g,
        '{ id: \'plant\'   as const, icon: \'potted_plant\', iconBg: \'bg-tertiary-fixed text-tertiary\',    tagBg: \'bg-tertiary-fixed/60 text-on-tertiary-fixed\',            tag: \'unwind.resetCard.plantTag\',         title: \'unwind.resetCard.plantTitle\', desc: \'unwind.resetCard.plantDesc\',     cta: \'unwind.resetCard.plantCta\',     ctaColor: \'text-tertiary\' },'
    ],
    [
        /const SOUNDS: \{ key: SoundKey; emoji: string; title: string; desc: string \}\[\] = \[\n  \{ key: 'rain',    emoji: '🌧️', title: 'Campus Rain',     desc: 'Soft rain outside a quiet campus window.' \},\n  \{ key: 'library', emoji: '📚',         title: 'Quiet Library',   desc: 'Low ambient pages turning & distant footsteps.' \},\n  \{ key: 'wind',    emoji: '🌿',         title: 'Gentle Wind',     desc: 'Soft rustling leaves across the campus quad.' \},\n  \{ key: 'cafe',    emoji: '☕',          title: 'Late Night Café', desc: 'Distant espresso steam & cozy murmurs.' \},\n  \{ key: 'night',   emoji: '🌙',         title: 'Night Room',      desc: 'Warm room fan & subtle nighttime silence.' \},\n\];/g,
        'const SOUNDS = [\n  { key: \'rain\',    emoji: \'🌧️\', title: \'unwind.soundRainTitle\',     desc: \'unwind.soundRainDesc\' },\n  { key: \'library\', emoji: \'📚\',         title: \'unwind.soundLibraryTitle\',   desc: \'unwind.soundLibraryDesc\' },\n  { key: \'wind\',    emoji: \'🌿\',         title: \'unwind.soundWindTitle\',     desc: \'unwind.soundWindDesc\' },\n  { key: \'cafe\',    emoji: \'☕\',          title: \'unwind.soundCafeTitle\', desc: \'unwind.soundCafeDesc\' },\n  { key: \'night\',   emoji: \'🌙\',         title: \'unwind.soundNightTitle\',      desc: \'unwind.soundNightDesc\' },\n];'
    ],
    [
        /<span className=\{`inline-block px-2\.5 py-0\.5 rounded-full \$\{card\.tagBg\} font-label-sm text-\[11px\] mb-2`\}>\{card\.tag\}<\/span>\n                    <h3 className="font-headline-sm text-\[18px\] text-on-surface group-hover:text-primary transition-colors">\{card\.title\}<\/h3>\n                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1\.5">\{card\.desc\}<\/p>\n                  <\/div>\n                  <div className=\{`mt-6 pt-3 flex items-center justify-between \$\{card\.ctaColor\} font-label-sm text-label-sm`\}>\n                    <span>\{card\.cta\}<\/span>/g,
        '<span className={`inline-block px-2.5 py-0.5 rounded-full ${card.tagBg} font-label-sm text-[11px] mb-2`}>{t(card.tag)}</span>\n                    <h3 className="font-headline-sm text-[18px] text-on-surface group-hover:text-primary transition-colors">{t(card.title)}</h3>\n                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">{t(card.desc)}</p>\n                  </div>\n                  <div className={`mt-6 pt-3 flex items-center justify-between ${card.ctaColor} font-label-sm text-label-sm`}>\n                    <span>{t(card.cta)}</span>'
    ],
    [
        /<h3 className="font-headline-sm text-\[16px\] text-on-surface font-semibold">\{title\}<\/h3>\n                      <p className="font-body-sm text-\[13px\] text-on-surface-variant mt-1">\{desc\}<\/p>/g,
        '<h3 className="font-headline-sm text-[16px] text-on-surface font-semibold">{t(title)}</h3>\n                      <p className="font-body-sm text-[13px] text-on-surface-variant mt-1">{t(desc)}</p>'
    ],
    [
        /\{SOUND_LABELS\[activeSound\]\}/g,
        '{t(SOUNDS.find(s => s.key === activeSound)?.title || "")}'
    ]
];

for (const [pat, rep] of replacements) {
    content = content.replace(pat, rep);
}

// Special fixes for placeholders and dynamic arrays:
content = content.replace(
    /if \(item\.category === 'academic'\)  return \{ text: 'Open the file and identify the easiest part to start with\.', duration: 10 \};/g,
    'if (item.category === \'academic\')  return { text: \'unwind.stepAcademic\', duration: 10 };'
);
content = content.replace(
    /if \(item\.category === 'deadline'\)  return \{ text: 'Write down the one thing you must remember for this deadline\.', duration: 5 \};/g,
    'if (item.category === \'deadline\')  return { text: \'unwind.stepDeadline\', duration: 5 };'
);
content = content.replace(
    /if \(item\.category === 'social'\)    return \{ text: 'Send one short message to check in with whoever is involved\.', duration: 5 \};/g,
    'if (item.category === \'social\')    return { text: \'unwind.stepSocial\', duration: 5 };'
);
content = content.replace(
    /if \(item\.category === 'health'\)    return \{ text: 'Do one small thing for your body: water, stretch, or a short walk\.', duration: 5 \};/g,
    'if (item.category === \'health\')    return { text: \'unwind.stepHealth\', duration: 5 };'
);
content = content.replace(
    /if \(item\.category === 'financial'\) return \{ text: 'Open your banking app and just look at the number\. No decisions yet\.', duration: 5 \};/g,
    'if (item.category === \'financial\') return { text: \'unwind.stepFinancial\', duration: 5 };'
);
content = content.replace(
    /return \{ text: 'Write down three things you remember about this task\.', duration: 10 \};/g,
    'return { text: \'unwind.stepDefault\', duration: 10 };'
);
content = content.replace(
    /<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">\{ms\.text\}<\/p>/g,
    '<p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-sm">{t(ms.text)}</p>'
);
content = content.replace(
    /const phaseLabel: Record<BreathPhase, string> = \{ inhale: 'Inhale', hold: 'Hold', exhale: 'Exhale' \};/g,
    'const phaseLabel: Record<BreathPhase, string> = { inhale: t(\'unwind.inhale\'), hold: t(\'unwind.hold\'), exhale: t(\'unwind.exhale\') };'
);
content = content.replace(
    /<strong className="text-tertiary">Next tiny move:<\/strong> \{ms\.text\}/g,
    '<strong className="text-tertiary">{t(\'unwind.nextTinyMove\')}</strong> {t(ms.text)}'
);


fs.writeFileSync('src/pages/Unwind.tsx', content, 'utf8');
console.log('Unwind Done');
