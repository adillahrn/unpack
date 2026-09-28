import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Pax from '@/components/Pax';
import { useTranslation } from '@/i18n';

interface ArticleData {
  id: string;
  emoji: string;
  titleId: string;
  titleEn: string;
  summaryId: string;
  summaryEn: string;
  contentId: string[];
  contentEn: string[];
  takeawayId: string;
  takeawayEn: string;
}

const articles: ArticleData[] = [
  {
    id: '1',
    emoji: '🧠',
    titleId: 'Apa itu Mental Clutter (Pikiran Menumpuk)?',
    titleEn: 'What is mental clutter?',
    summaryId: 'Memahami kebisingan dan tumpukan beban di kepala.',
    summaryEn: 'Understanding the noise in your head.',
    contentId: [
      'Mental clutter adalah aliran pikiran, rasa cemas, dan daftar tugas yang terus berputar tanpa henti di kepalamu. Rasanya seperti membuka 50 tab browser secara bersamaan.',
      'Saat pikiran penuh, kamu akan lebih sulit fokus, lambat mengambil keputusan, dan sulit merasa tenang meskipun tugas resmimu tidak terlalu banyak.',
      'Langkah awal mengatasi pikiran menumpuk adalah menyadarinya. Menuangkan apa yang dirasakan ke dalam tulisan membantu otak memprosesnya dengan lebih jernih.',
    ],
    contentEn: [
      "Mental clutter is the constant stream of thoughts, worries, and to-do lists running through your mind. It's like having too many browser tabs open at once.",
      "When your mind is cluttered, it becomes harder to focus, make decisions, and feel at peace. You might feel overwhelmed even when your actual tasks aren't that many.",
      "The first step to dealing with mental clutter is acknowledging it. Simply writing down what's on your mind can help you see your thoughts more clearly.",
    ],
    takeawayId: 'Kapasitas otakmu terbatas. Mengeluarkan pikiran membuka ruang agar kamu bisa berpikir lebih jernih.',
    takeawayEn: 'Your mind has limited bandwidth. Unloading your thoughts frees up space to think clearly.',
  },
  {
    id: '2',
    emoji: '👣',
    titleId: 'Mengapa Langkah Kecil Sangat Membantu',
    titleEn: 'Why small steps help',
    summaryId: 'Kekuatan memulai dari hal yang sangat kecil.',
    summaryEn: 'The power of starting tiny.',
    contentId: [
      'Saat kita merasa sangat kewalahan, otak kita masuk ke mode membeku (freeze mode). Tugas besar terasa mustahil dikerjakan, dan kita berakhir tidak melakukan apa-apa.',
      'Langkah kecil berhasil karena melewati respon beku tersebut. Membuka laptop tidak terasa menakutkan. Menulis satu kalimat tidak terasa membebani.',
      'Begitu kamu mulai, momentum akan bekerja. Bagian tersulit selalu pada langkah pertama — maka buatlah langkah tersebut sangat kecil.',
    ],
    contentEn: [
      "When we're overwhelmed, our brain goes into freeze mode. Big tasks feel impossible, and we end up doing nothing.",
      "Small steps work because they bypass this freeze response. Opening your laptop doesn't feel scary. Writing one sentence doesn't feel overwhelming.",
      "Once you start, momentum takes over. The hardest part is always the first step — so make it ridiculously small.",
    ],
    takeawayId: 'Kamu tidak butuh motivasi besar untuk mulai. Kamu hanya perlu membuat langkah pertama cukup kecil hingga terasa sangat mudah.',
    takeawayEn: "You don't need motivation to start. You need to make the first step small enough that it feels effortless.",
  },
  {
    id: '3',
    emoji: '🌿',
    titleId: 'Stres & Pemulihan (Recovery)',
    titleEn: 'Stress & recovery',
    summaryId: 'Mengapa istirahat juga merupakan bagian dari produktivitas.',
    summaryEn: 'Why rest is productive too.',
    contentId: [
      'Stres tidak selalu buruk — ini adalah cara tubuh bersiap menghadapi tantangan. Namun tanpa pemulihan, stres menumpuk dan menjadi berbahaya.',
      'Pemulihan bukan sekadar tidur. Pemulihan adalah kegiatan apa pun yang menenangkan sistem saraf: jalan santai, napas dalam, mengobrol dengan teman, atau melihat pemandangan.',
      'Bayangkan dirimu seperti baterai ponsel. Kamu tidak bisa berjalan 100% sepanjang hari tanpa mengisi ulang daya.',
    ],
    contentEn: [
      "Stress isn't always bad — it's your body's way of preparing for challenges. But without recovery, stress accumulates and becomes harmful.",
      "Recovery isn't just sleeping. It's any activity that helps your nervous system calm down: a walk, deep breaths, talking to a friend, or even staring out the window.",
      "Think of yourself like a phone battery. You can't run at 100% all day without charging.",
    ],
    takeawayId: 'Jadwalkan pemulihan sama seperti kamu menjadwalkan tugas. Otakmu butuh jeda untuk bisa bekerja secara optimal.',
    takeawayEn: 'Schedule recovery like you schedule work. Your brain needs downtime to perform at its best.',
  },
  {
    id: '4',
    emoji: '☕',
    titleId: 'Pentingnya Istirahat Berkala',
    titleEn: 'Taking breaks',
    summaryId: 'Bukan malas — tapi kebutuhan.',
    summaryEn: 'Not lazy — necessary.',
    contentId: [
      'Riset menunjukkan bahwa istirahat teratur justru meningkatkan produktivitas dan kreativitas. Otak memproses informasi penting saat istirahat.',
      'Teknik Pomodoro (25 menit kerja + 5 menit istirahat) sangat populer karena bekerja selaras dengan siklus fokus alami otak.',
      'Istirahat yang baik berarti benar-benar menjauh dari layar. Gerakkan tubuhmu, lihat objek yang jauh, atau sekadar bernapas.',
    ],
    contentEn: [
      'Research shows that taking regular breaks actually improves productivity and creativity. Your brain does important processing during rest.',
      "The Pomodoro technique (25 min work + 5 min break) is popular because it works with your brain's natural attention cycles.",
      'A good break means truly stepping away — not switching to another screen. Move your body, look at something far away, or just breathe.',
    ],
    takeawayId: 'Istirahat bukanlah hadiah setelah selesai bekerja, melainkan alat untuk bekerja lebih baik.',
    takeawayEn: "Breaks aren't a reward for finishing. They're a tool for doing better work.",
  },
  {
    id: '5',
    emoji: '💚',
    titleId: 'Kapan Harus Mencari Bantuan',
    titleEn: 'When to seek support',
    summaryId: 'Tidak apa-apa untuk meminta bantuan.',
    summaryEn: "It's okay to ask for help.",
    contentId: [
      'Setiap orang pernah mengalami masa sulit, dan itu wajar. Namun jika kamu merasa terus-menerus kewalahan, cemas, atau sulit berfungsi, mungkin ini saatnya berbicara dengan profesional.',
      'Layanan konseling kampus biasanya gratis dan rahasia. Kamu tidak perlu alasan "besar" untuk berkonsultasi — merasa cemas dengan perkuliahan sudah cukup.',
      'Meminta bantuan adalah tanda keberanian. Profesional kesehatan mental dilatih untuk membantumu menemukan strategi terbaik.',
    ],
    contentEn: [
      "Everyone struggles sometimes, and that's completely normal. But if you're feeling persistently overwhelmed, sad, anxious, or unable to function, it might be time to talk to someone.",
      'University counseling services are free and confidential. You don\'t need a "big" reason to go — feeling stressed about school is enough.',
      'Asking for help is a sign of strength, not weakness. Mental health professionals are trained to help you develop coping strategies.',
    ],
    takeawayId: 'Kamu tidak harus menyelesaikan semuanya sendirian. Meminta bantuan adalah hal yang sangat berani.',
    takeawayEn: "You don't have to figure everything out alone. Reaching out is one of the bravest things you can do.",
  },
];

export default function Learn() {
  const { locale, t } = useTranslation();
  const [selectedArticle, setSelectedArticle] = useState<ArticleData | null>(null);

  if (selectedArticle) {
    const title = locale === 'id' ? selectedArticle.titleId : selectedArticle.titleEn;
    const content = locale === 'id' ? selectedArticle.contentId : selectedArticle.contentEn;
    const takeaway = locale === 'id' ? selectedArticle.takeawayId : selectedArticle.takeawayEn;

    return (
      <div className="py-8 animate-fade-in max-w-2xl mx-auto px-margin">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-primary font-medium mb-6 hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          ← {locale === 'id' ? 'Kembali ke daftar artikel' : 'Back to articles'}
        </button>

        <div className="text-center mb-8">
          <span className="text-5xl">{selectedArticle.emoji}</span>
          <h1 className="text-2xl font-bold text-on-surface mt-4">{title}</h1>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {content.map((paragraph, i) => (
            <p key={i} className="text-on-surface-variant leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="bg-secondary-container/40 rounded-2xl p-5 mt-8 max-w-lg mx-auto border border-secondary-container">
          <p className="text-sm font-medium text-secondary mb-1">💡 {locale === 'id' ? 'Kesimpulan Utam' : 'Takeaway'}</p>
          <p className="text-on-surface font-medium">{takeaway}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 gap-6 max-w-2xl mx-auto px-margin">
      <Pax state="idle" size="sm" />
      <h1 className="text-2xl font-bold text-on-surface">{t('learn.title', 'Pusat Pembelajaran & Refleksi')}</h1>
      <p className="text-on-surface-variant text-center">
        {t('learn.subtitle', 'Artikel & panduan praktis untuk mengelola stres kuliah')}
      </p>

      <div className="w-full max-w-lg space-y-3">
        {articles.map((article) => {
          const title = locale === 'id' ? article.titleId : article.titleEn;
          const summary = locale === 'id' ? article.summaryId : article.summaryEn;

          return (
            <button
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="w-full flex items-center gap-4 bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left border border-outline-variant/20 cursor-pointer"
            >
              <span className="text-3xl">{article.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-on-surface">{title}</h3>
                <p className="text-sm text-on-surface-variant">{summary}</p>
              </div>
              <ChevronRight size={18} className="text-on-surface-variant/50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
