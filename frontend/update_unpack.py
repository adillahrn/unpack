import re

with open('src/pages/Unpack.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. defaultText handling
content = re.sub(
    r'const defaultText =[\s\S]*?begin…\";',
    '',
    content
)

content = re.sub(
    r'const \{ t \} = useTranslation\(\);',
    'const { locale, t } = useTranslation();',
    content
)

content = re.sub(
    r'const \[text, setText\] = useState\(defaultText\);',
    'const [text, setText] = useState(() => t(\'unpack.defaultInput\'));',
    content
)

content = re.sub(
    r'const result = await unpackMindDump\(text\);',
    'const result = await unpackMindDump(text, locale);',
    content
)

# 2. String replacements
replacements = [
    (
        r'<span className=\"text-label-md text-primary font-bold uppercase tracking-wider\">Step 01 of 02</span>\s*<span className=\"text-outline text-label-md\">•</span>\s*<span className=\"text-label-md text-on-surface-variant\">Brain Dump &amp; Sorting</span>',
        '<span className=\"text-label-md text-primary font-bold uppercase tracking-wider\">{t(\'unpack.stepBar\')}</span>\\n            <span className=\"text-outline text-label-md\">•</span>\\n            <span className=\"text-label-md text-on-surface-variant\">{t(\'unpack.stepTitle\')}</span>'
    ),
    (
        r'<h1 className=\"text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs\">\s*What\'s taking up space in your mind right now\?\s*</h1>\s*<p className=\"text-body-lg text-on-surface-variant leading-relaxed\">\s*Dump it all out. Don\'t worry about spelling, punctuation, or organizing it. Pax will sift through the noise and help sort the weight.\s*</p>',
        '<h1 className=\"text-display-lg text-on-surface tracking-tight leading-tight mb-space-xs\">\\n              {t(\'unpack.mainHeading\')}\\n            </h1>\\n            <p className=\"text-body-lg text-on-surface-variant leading-relaxed\">\\n              {t(\'unpack.mainSubheading\')}\\n            </p>'
    ),
    (
        r'<span className=\"text-label-md text-on-surface-variant\">Looseleaf Thought Sheet</span>',
        '<span className=\"text-label-md text-on-surface-variant\">{t(\'unpack.sheetTitle\')}</span>'
    ),
    (
        r'<span className=\"material-symbols-outlined text-\[15px\]\">ink_eraser</span> Clear',
        '<span className=\"material-symbols-outlined text-[15px]\">ink_eraser</span> {t(\'unpack.clear\')}'
    ),
    (
        r'\{isListening \? \'Listening…\' : \'Voice Dump\'\}',
        '{isListening ? t(\'unpack.listening\') : t(\'unpack.voiceDump\')}'
    ),
    (
        r'placeholder=\"Dump everything here\.\.\. exams, late laundry, messy texts, unread emails\.\.\.\"',
        'placeholder={t(\'unpack.placeholder\')}'
    ),
    (
        r'<span className=\"text-label-sm font-bold text-primary uppercase tracking-wider\">PAX • Your Companion</span>',
        '<span className=\"text-label-sm font-bold text-primary uppercase tracking-wider\">{t(\'unpack.paxCardTitle\')}</span>'
    ),
    (
        r'<p className=\"text-body-md text-on-surface leading-relaxed mb-space-lg\">\s*I\'m here to listen, no judgement.\s*</p>',
        '<p className=\"text-body-md text-on-surface leading-relaxed mb-space-lg\">\\n                {t(\'unpack.paxCardDesc\')}\\n              </p>'
    ),
    (
        r'<span>Talk to PAX</span>',
        '<span>{t(\'unpack.paxCardBtn\')}</span>'
    ),
    (
        r'\{selectedIndices.length === items.length \? \'Deselect All\' : \'Select All\'\}',
        '{selectedIndices.length === items.length ? t(\'unpack.deselectAll\') : t(\'unpack.selectAll\')}'
    ),
    (
        r'<strong className=\"text-on-surface\">\{selectedIndices.length\}</strong> of \{items.length\} selected',
        '<strong className=\"text-on-surface\">{selectedIndices.length}</strong> {t(\'unpack.selectedOf\')} {items.length} {t(\'unpack.selectedLabel\')}'
    ),
    (
        r'<h3 className=\"text-headline-sm text-on-surface font-bold\">Select items to put in your Bag</h3>\s*<p className=\"text-body-sm text-on-surface-variant\">\s*\{selectedIndices.length === 0\s*\?\s*\'Check the items above that you want to carry today\.\'\s*:\s*`Ready to save \$\{selectedIndices.length\} selected item\$\{selectedIndices.length > 1 \? \'s\' : \'\'\} to My Bag\.`\}\s*</p>',
        '<h3 className=\"text-headline-sm text-on-surface font-bold\">{t(\'unpack.saveSectionTitle\')}</h3>\\n                  <p className=\"text-body-sm text-on-surface-variant\">\\n                    {selectedIndices.length === 0\\n                      ? t(\'unpack.saveSectionDesc0\')\\n                      : t(\'unpack.saveSectionDescN\').replace(\'{count}\', selectedIndices.length.toString())}\\n                  </p>'
    ),
    (
        r'<span>Saving to Bag…</span>',
        '<span>{t(\'unpack.saving\')}</span>'
    ),
    (
        r'<span>Save \(\{selectedIndices.length\}\) to My Bag 🎒</span>',
        '<span>{t(\'unpack.saveToBag\').replace(\'🎒\', `(${selectedIndices.length}) 🎒`)}</span>'
    ),
    (
        r'<p className=\"text-body-sm text-on-secondary-container/80\">Items are now stored in your bag visualizer\.</p>',
        '<p className=\"text-body-sm text-on-secondary-container/80\">{t(\'unpack.saveSuccessDesc\')}</p>'
    ),
    (
        r'Open My Bag →',
        '{t(\'unpack.openMyBag\')}'
    ),
    (
        r'<span className=\"text-label-sm uppercase tracking-wider text-primary font-bold\">Next Phase</span>\s*<h3 className=\"text-headline-md text-on-surface\">Feeling ready for one small step\?</h3>\s*<p className=\"text-body-sm text-on-surface-variant\">\s*We\'ll take just the single top priority card for a frictionless 10-minute start\.\s*</p>',
        '<span className=\"text-label-sm uppercase tracking-wider text-primary font-bold\">{t(\'unpack.nextPhaseLabel\')}</span>\\n              <h3 className=\"text-headline-md text-on-surface\">{t(\'unpack.nextPhaseTitle\')}</h3>\\n              <p className=\"text-body-sm text-on-surface-variant\">\\n                {t(\'unpack.nextPhaseDesc\')}\\n              </p>'
    ),
    (
        r'<span>Proceed to Small Action</span>',
        '<span>{t(\'unpack.btnNextPhase\')}</span>'
    ),
    (
        r'setSaveSuccessMessage\(`\$\{selectedItems.length\} item\$\{selectedItems.length > 1 \? \'s\' : \'\'\} saved to My Bag! 🎒`\);',
        'setSaveSuccessMessage(t(\'unpack.saveSuccess\').replace(\'{count}\', selectedItems.length.toString()));'
    ),
    (
        r'key: \'all\',\s*label: `All \(\$\{items.length\}\)`',
        'key: \'all\', label: `${t(\'unpack.filterAll\')} (${items.length})`'
    )
]

for pat, rep in replacements:
    content = re.sub(pat, rep, content)

with open('src/pages/Unpack.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
