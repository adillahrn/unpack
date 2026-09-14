import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Pax from '@/components/Pax';

interface Article {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  content: string[];
  takeaway: string;
}

const articles: Article[] = [
  {
    id: '1',
    emoji: '🧠',
    title: 'What is mental clutter?',
    summary: 'Understanding the noise in your head.',
    content: [
      'Mental clutter is the constant stream of thoughts, worries, and to-do lists running through your mind. It\'s like having too many browser tabs open at once.',
      'When your mind is cluttered, it becomes harder to focus, make decisions, and feel at peace. You might feel overwhelmed even when your actual tasks aren\'t that many.',
      'The first step to dealing with mental clutter is acknowledging it. Simply writing down what\'s on your mind can help you see your thoughts more clearly.',
    ],
    takeaway: 'Your mind has limited bandwidth. Unloading your thoughts frees up space to think clearly.',
  },
  {
    id: '2',
    emoji: '👣',
    title: 'Why small steps help',
    summary: 'The power of starting tiny.',
    content: [
      'When we\'re overwhelmed, our brain goes into freeze mode. Big tasks feel impossible, and we end up doing nothing.',
      'Small steps work because they bypass this freeze response. Opening your laptop doesn\'t feel scary. Writing one sentence doesn\'t feel overwhelming.',
      'Once you start, momentum takes over. The hardest part is always the first step — so make it ridiculously small.',
    ],
    takeaway: 'You don\'t need motivation to start. You need to make the first step small enough that it feels effortless.',
  },
  {
    id: '3',
    emoji: '🌿',
    title: 'Stress & recovery',
    summary: 'Why rest is productive too.',
    content: [
      'Stress isn\'t always bad — it\'s your body\'s way of preparing for challenges. But without recovery, stress accumulates and becomes harmful.',
      'Recovery isn\'t just sleeping. It\'s any activity that helps your nervous system calm down: a walk, deep breaths, talking to a friend, or even staring out the window.',
      'Think of yourself like a phone battery. You can\'t run at 100% all day without charging.',
    ],
    takeaway: 'Schedule recovery like you schedule work. Your brain needs downtime to perform at its best.',
  },
  {
    id: '4',
    emoji: '☕',
    title: 'Taking breaks',
    summary: 'Not lazy — necessary.',
    content: [
      'Research shows that taking regular breaks actually improves productivity and creativity. Your brain does important processing during rest.',
      'The Pomodoro technique (25 min work + 5 min break) is popular because it works with your brain\'s natural attention cycles.',
      'A good break means truly stepping away — not switching to another screen. Move your body, look at something far away, or just breathe.',
    ],
    takeaway: 'Breaks aren\'t a reward for finishing. They\'re a tool for doing better work.',
  },
  {
    id: '5',
    emoji: '💚',
    title: 'When to seek support',
    summary: 'It\'s okay to ask for help.',
    content: [
      'Everyone struggles sometimes, and that\'s completely normal. But if you\'re feeling persistently overwhelmed, sad, anxious, or unable to function, it might be time to talk to someone.',
      'University counseling services are free and confidential. You don\'t need a "big" reason to go — feeling stressed about school is enough.',
      'Asking for help is a sign of strength, not weakness. Mental health professionals are trained to help you develop coping strategies.',
    ],
    takeaway: 'You don\'t have to figure everything out alone. Reaching out is one of the bravest things you can do.',
  },
];

export default function Learn() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <div className="py-8 animate-fade-in">
        <button
          onClick={() => setSelectedArticle(null)}
          className="text-coral font-medium mb-6 hover:underline"
        >
          ← Back to articles
        </button>

        <div className="text-center mb-8">
          <span className="text-5xl">{selectedArticle.emoji}</span>
          <h1 className="text-2xl font-bold text-midnight mt-4">{selectedArticle.title}</h1>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {selectedArticle.content.map((paragraph, i) => (
            <p key={i} className="text-bark/80 leading-relaxed">{paragraph}</p>
          ))}
        </div>

        <div className="bg-sage/20 rounded-2xl p-5 mt-8 max-w-lg mx-auto">
          <p className="text-sm font-medium text-bark/60 mb-1">💡 Takeaway</p>
          <p className="text-midnight font-medium">{selectedArticle.takeaway}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-8 gap-6">
      <Pax state="idle" size="sm" />
      <h1 className="text-2xl font-bold text-midnight">Learn</h1>
      <p className="text-bark/70 text-center">Short reads to help you understand yourself better.</p>

      <div className="w-full max-w-lg space-y-3">
        {articles.map((article) => (
          <button
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
          >
            <span className="text-3xl">{article.emoji}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-midnight">{article.title}</h3>
              <p className="text-sm text-bark/60">{article.summary}</p>
            </div>
            <ChevronRight size={18} className="text-bark/30" />
          </button>
        ))}
      </div>
    </div>
  );
}
