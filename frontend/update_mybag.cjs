const fs = require('fs');

let content = fs.readFileSync('src/pages/MyBag.tsx', 'utf8');

const replacements = [
    [
        /<h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface mb-2">\s*Inside Your Bag\s*<\/h3>/g,
        '<h3 className="font-headline-sm text-headline-sm font-bold text-center text-on-surface mb-2">{t(\'mybag.insideYourBag\')}</h3>'
    ],
    [
        /<p className="text-body-sm text-center text-on-surface-variant mb-6">\s*Your tasks are automatically sorted into different pockets based on urgency and category\.\s*<\/p>/g,
        '<p className="text-body-sm text-center text-on-surface-variant mb-6">{t(\'mybag.insideYourBagDesc\')}</p>'
    ],
    [
        /Top Flap \(Immediate\)/g,
        '{t(\'mybag.topFlap\')}'
    ],
    [
        /Main Pocket \(Academic\)/g,
        '{t(\'mybag.mainPocket\')}'
    ],
    [
        /Front Pouch \(Self-Care\)/g,
        '{t(\'mybag.frontPouch\')}'
    ],
    [
        /Side Mesh \(Social\)/g,
        '{t(\'mybag.sideMesh\')}'
    ],
    [
        /Unpacked History/g,
        '{t(\'mybag.unpackedHistory\')}'
    ],
    [
        /No items found for this filter\./g,
        '{t(\'mybag.noItemsFilter\')}'
    ],
    [
        /<LoadingState message="Loading your bag\.\.\." \/>/g,
        '<LoadingState message={t(\'mybag.loadingBag\')} />'
    ],
    [
        /\{t\('mybag\.delete', 'Hapus'\)\}/g,
        '{t(\'mybag.delete\')}'
    ],
    [
        /\{t\('mybag\.statusPending', 'In Bag'\)\}/g,
        '{t(\'mybag.statusPending\')}'
    ],
    [
        /\{t\('mybag\.statusResolved', 'Resolved'\)\}/g,
        '{t(\'mybag.statusResolved\')}'
    ],
    [
        /\{t\('mybag\.filterAll', 'All'\)\}/g,
        '{t(\'mybag.filterAll\')}'
    ],
    [
        /\{t\('mybag\.filterUrgent', 'Urgent'\)\}/g,
        '{t(\'mybag.filterUrgent\')}'
    ],
    [
        /\{t\('mybag\.filterAcademic', 'Academic'\)\}/g,
        '{t(\'mybag.filterAcademic\')}'
    ],
    [
        /\{t\('mybag\.filterPersonal', 'Personal'\)\}/g,
        '{t(\'mybag.filterPersonal\')}'
    ],
    [
        /\{t\('mybag\.capacityFull', 'Bag Full!'\)\}/g,
        '{t(\'mybag.capacityFull\')}'
    ],
    [
        /\{t\('mybag\.capacityOk', 'Bag Capacity Safe'\)\}/g,
        '{t(\'mybag.capacityOk\')}'
    ],
    [
        /\{t\('mybag\.title', 'My Bag'\)\}/g,
        '{t(\'mybag.title\')}'
    ],
    [
        /\{t\('mybag\.subtitle', 'Collection of unpacked mental baggage & thoughts'\)\}/g,
        '{t(\'mybag.subtitle\')}'
    ],
    [
        /\{t\('mybag\.packItem', 'Pack New Item'\)\}/g,
        '{t(\'mybag.packItem\')}'
    ],
    [
        /\{t\('mybag\.empty', 'Your bag is empty! Start unpacking your thoughts now\.'\)\}/g,
        '{t(\'mybag.empty\')}'
    ],
    [
        /\{t\('nav\.unpack', 'Unpack'\)\}/g,
        '{t(\'nav.unpack\')}'
    ],
    [
        /\{t\(`unpack\.category\.\$\{item\.category\}`\, item\.category\)\}/g,
        '{t(`unpack.category.${item.category}`)}'
    ],
    [
        /\{t\(`unpack\.urgency\.\$\{item\.urgency\}`\, item\.urgency\)\}/g,
        '{t(`unpack.urgency.${item.urgency}`)}'
    ]
];

for (const [pat, rep] of replacements) {
    content = content.replace(pat, rep);
}

fs.writeFileSync('src/pages/MyBag.tsx', content, 'utf8');
console.log('MyBag Done');
