const fs = require('fs');

let content = fs.readFileSync('src/pages/Unpack.tsx', 'utf8');

// 1. defaultText handling
content = content.replace(/const defaultText =[\s\S]*?begin…\";/g, '');

content = content.replace(
    /const \{ t \} = useTranslation\(\);/g,
    'const { locale, t } = useTranslation();'
);

content = content.replace(
    /const \[text, setText\] = useState\(defaultText\);/g,
    'const [text, setText] = useState(() => t(\'unpack.defaultInput\'));'
);

content = content.replace(
    /const result = await unpackMindDump\(text\);/g,
    'const result = await unpackMindDump(text, locale);'
);

// 2. String replacements
const replacements = [
    [
        /<span className="text-label-md text-primary font-bold uppercase tracking-wider">Step 01 of 02<\/span>\s*<span className="text-outline text-label-md">•<\/span>\s*<span className="text-label-md text-on-surface-variant">Brain Dump &amp; Sorting<\/span>/g,
        '<span className="text-label-md text-primary font-bold uppercase tracking-wider">{t(\'unpack.stepBar\')}</span>\\n            <span className="text-outline text-label-md">•</span>\\n            <span className="text-label-md text-on-surface-variant">{t(\'unpack.stepTitle\')}</span>'
    ],
    [
        /<h1 className="text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs">\s*What's taking up space in your mind right now\?\s*<\/h1>\s*<p className="text-body-lg text-on-surface-variant leading-relaxed">\s*Dump it all out\. Don't worry about spelling, punctuation, or organizing it\. Pax will sift through the noise and help sort the weight\.\s*<\/p>/g,
        '<h1 className="text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs">\\n              {t(\'unpack.mainHeading\')}\\n            </h1>\\n            <p className="text-body-lg text-on-surface-variant leading-relaxed">\\n              {t(\'unpack.mainSubheading\')}\\n            </p>'
    ],
    [
        /<span className="text-label-md text-on-surface-variant">Looseleaf Thought Sheet<\/span>/g,
        '<span className="text-label-md text-on-surface-variant">{t(\'unpack.sheetTitle\')}</span>'
    ],
    [
        /<span className="material-symbols-outlined text-\[15px\]">ink_eraser<\/span> Clear/g,
        '<span className="material-symbols-outlined text-[15px]">ink_eraser</span> {t(\'unpack.clear\')}'
    ],
    [
        /\{isListening \? 'Listening…' : 'Voice Dump'\}/g,
        '{isListening ? t(\'unpack.listening\') : t(\'unpack.voiceDump\')}'
    ],
    [
        /placeholder="Dump everything here\.\.\. exams, late laundry, messy texts, unread emails\.\.\."/g,
        'placeholder={t(\'unpack.placeholder\')}'
    ],
    [
        /<span className="text-label-sm font-bold text-primary uppercase tracking-wider">PAX • Your Companion<\/span>/g,
        '<span className="text-label-sm font-bold text-primary uppercase tracking-wider">{t(\'unpack.paxCardTitle\')}</span>'
    ],
    [
        /<p className="text-body-md text-on-surface leading-relaxed mb-space-lg">\s*I'm here to listen, no judgement\.\s*<\/p>/g,
        '<p className="text-body-md text-on-surface leading-relaxed mb-space-lg">\\n                {t(\'unpack.paxCardDesc\')}\\n              </p>'
    ],
    [
        /<span>Talk to PAX<\/span>/g,
        '<span>{t(\'unpack.paxCardBtn\')}</span>'
    ],
    [
        /\{selectedIndices\.length === items\.length \? 'Deselect All' : 'Select All'\}/g,
        '{selectedIndices.length === items.length ? t(\'unpack.deselectAll\') : t(\'unpack.selectAll\')}'
    ],
    [
        /<strong className="text-on-surface">\{selectedIndices\.length\}<\/strong> of \{items\.length\} selected/g,
        '<strong className="text-on-surface">{selectedIndices.length}</strong> {t(\'unpack.selectedOf\')} {items.length} {t(\'unpack.selectedLabel\')}'
    ],
    [
        /<h3 className="text-headline-sm text-on-surface font-bold">Select items to put in your Bag<\/h3>\s*<p className="text-body-sm text-on-surface-variant">\s*\{selectedIndices\.length === 0\s*\?\s*'Check the items above that you want to carry today\.'\s*:\s*`Ready to save \$\{selectedIndices\.length\} selected item\$\{selectedIndices\.length > 1 \? 's' : ''\} to My Bag\.`\}\s*<\/p>/g,
        '<h3 className="text-headline-sm text-on-surface font-bold">{t(\'unpack.saveSectionTitle\')}</h3>\\n                  <p className="text-body-sm text-on-surface-variant">\\n                    {selectedIndices.length === 0\\n                      ? t(\'unpack.saveSectionDesc0\')\\n                      : t(\'unpack.saveSectionDescN\').replace(\'{count}\', selectedIndices.length.toString())}\\n                  </p>'
    ],
    [
        /<span>Saving to Bag…<\/span>/g,
        '<span>{t(\'unpack.saving\')}</span>'
    ],
    [
        /<span>Save \(\{selectedIndices\.length\}\) to My Bag 🎒<\/span>/g,
        '<span>{t(\'unpack.saveToBag\').replace(\'🎒\', `(${selectedIndices.length}) 🎒`)}</span>'
    ],
    [
        /<p className="text-body-sm text-on-secondary-container\/80">Items are now stored in your bag visualizer\.<\/p>/g,
        '<p className="text-body-sm text-on-secondary-container/80">{t(\'unpack.saveSuccessDesc\')}</p>'
    ],
    [
        /Open My Bag →/g,
        '{t(\'unpack.openMyBag\')}'
    ],
    [
        /<span className="text-label-sm uppercase tracking-wider text-primary font-bold">Next Phase<\/span>\s*<h3 className="text-headline-md text-on-surface">Feeling ready for one small step\?<\/h3>\s*<p className="text-body-sm text-on-surface-variant">\s*We'll take just the single top priority card for a frictionless 10-minute start\.\s*<\/p>/g,
        '<span className="text-label-sm uppercase tracking-wider text-primary font-bold">{t(\'unpack.nextPhaseLabel\')}</span>\\n              <h3 className="text-headline-md text-on-surface">{t(\'unpack.nextPhaseTitle\')}</h3>\\n              <p className="text-body-sm text-on-surface-variant">\\n                {t(\'unpack.nextPhaseDesc\')}\\n              </p>'
    ],
    [
        /<span>Proceed to Small Action<\/span>/g,
        '<span>{t(\'unpack.btnNextPhase\')}</span>'
    ],
    [
        /setSaveSuccessMessage\(`\$\{selectedItems\.length\} item\$\{selectedItems\.length > 1 \? 's' : ''\} saved to My Bag! 🎒`\);/g,
        'setSaveSuccessMessage(t(\'unpack.saveSuccess\').replace(\'{count}\', selectedItems.length.toString()));'
    ],
    [
        /key: 'all',\s*label: `All \(\$\{items\.length\}\)`/g,
        'key: \'all\', label: `${t(\'unpack.filterAll\')} (${items.length})`'
    ]
];

for (const [pat, rep] of replacements) {
    content = content.replace(pat, rep);
}

fs.writeFileSync('src/pages/Unpack.tsx', content, 'utf8');
console.log('Done');
