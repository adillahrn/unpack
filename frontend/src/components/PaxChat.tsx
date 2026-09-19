import { useState, useRef, useEffect, useCallback } from 'react';
import {
  type ChatMessage,
  type MoodResult,
  sendChatMessage,
  scanForDistress,
  createMessageId,
} from '@/services/chatService';

/* ── Mood config ─────────────────────────────────────────────── */

const MOOD_META: Record<string, { emoji: string; label: string; color: string }> = {
  happy: { emoji: '☀️', label: 'You seem cheerful today!', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
  sad: { emoji: '🌧️', label: 'You seem a little down today.', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  anxious: { emoji: '🌪️', label: 'You seem a little anxious today.', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
  calm: { emoji: '🌿', label: 'You seem calm and collected.', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' },
  energized: { emoji: '⚡', label: 'You seem full of energy!', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200' },
};

const MOOD_RECOMMENDATIONS: Record<string, { emoji: string; text: string; link?: string }[]> = {
  anxious: [
    { emoji: '🌿', text: '1-minute breathing exercise' },
    { emoji: '🎵', text: 'Calm playlist', link: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u' },
    { emoji: '📝', text: 'Write down what\'s worrying you' },
  ],
  sad: [
    { emoji: '🌿', text: '1-minute breathing exercise' },
    { emoji: '🎵', text: 'Feel-good playlist', link: 'https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC' },
    { emoji: '☕', text: 'Make yourself a warm drink' },
  ],
};

const PAX_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'model',
  text: "Hey, I'm here. What's on your mind?",
  timestamp: Date.now(),
};

const QUICK_PROMPTS = [
  { emoji: '🔥', text: 'Tips agar tidak burnout' },
  { emoji: '🎯', text: 'Rekomendasikan kegiatan yang menyenangkan' },
  { emoji: '😴', text: 'Aku susah tidur akhir-akhir ini' },
  { emoji: '💪', text: 'Cara menjaga semangat belajar' },
  { emoji: '🧘', text: 'Bantu aku tenangkan pikiran' },
  { emoji: '💚', text: 'Aku butuh dukungan mental health' },
];

/* ── Component ───────────────────────────────────────────────── */

interface PaxChatProps {
  onClose: () => void;
}

export default function PaxChat({ onClose }: PaxChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([PAX_GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<MoodResult | null>(null);
  const [showDistressCard, setShowDistressCard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showDistressCard]);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClick = () => setShowMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showMenu]);

  const handleNewChat = useCallback(() => {
    setMessages([{ ...PAX_GREETING, id: createMessageId(), timestamp: Date.now() }]);
    setCurrentMood(null);
    setShowDistressCard(false);
    setError(null);
    setShowMenu(false);
  }, []);

  const handleClearConversation = useCallback(() => {
    setMessages([]);
    setCurrentMood(null);
    setShowDistressCard(false);
    setError(null);
    setShowMenu(false);
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setError(null);

    // Add user message
    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Client-side distress scan (immediate)
    if (scanForDistress(trimmed)) {
      setShowDistressCard(true);
    }

    // Build history for API (exclude greeting if it's the default)
    const history = messages
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({ role: m.role, text: m.text }));

    setIsTyping(true);

    try {
      const response = await sendChatMessage(trimmed, history);

      const paxMsg: ChatMessage = {
        id: createMessageId(),
        role: 'model',
        text: response.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, paxMsg]);
      setCurrentMood(response.mood);

      // API-level distress detection
      if (response.distress) {
        setShowDistressCard(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  const handleQuickPrompt = useCallback((promptText: string) => {
    if (isTyping) return;
    // Use a microtask to ensure state is set before triggering send
    setTimeout(() => {
      setInput('');
      const userMsg: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        text: promptText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setError(null);

      if (scanForDistress(promptText)) {
        setShowDistressCard(true);
      }

      const history = messages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({ role: m.role, text: m.text }));

      setIsTyping(true);

      sendChatMessage(promptText, history)
        .then((response) => {
          const paxMsg: ChatMessage = {
            id: createMessageId(),
            role: 'model',
            text: response.reply,
            timestamp: Date.now(),
          };
          setMessages((prev) => [...prev, paxMsg]);
          setCurrentMood(response.mood);
          if (response.distress) setShowDistressCard(true);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
        })
        .finally(() => {
          setIsTyping(false);
        });
    }, 0);
  }, [isTyping, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const moodMeta = currentMood ? MOOD_META[currentMood.label] : null;
  const recommendations = currentMood ? MOOD_RECOMMENDATIONS[currentMood.label] : null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-[slideUp_0.3s_ease-out]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Chat container */}
      <div className="relative z-10 flex flex-col w-full max-w-lg mx-auto h-full sm:h-[calc(100vh-2rem)] sm:my-4 bg-surface rounded-none sm:rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center justify-between px-space-lg py-space-md bg-surface-container-low border-b border-outline-variant/30 shrink-0">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
              <img src="/unpack_logo.png" alt="PAX" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h2 className="text-label-lg text-on-surface font-bold leading-tight">PAX</h2>
              <p className="text-label-sm text-on-surface-variant">Your space to unpack</p>
            </div>
          </div>

          <div className="flex items-center gap-space-xs">
            {/* Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Menu"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">more_vert</span>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 py-1 min-w-[180px] z-50 animate-[fadeIn_0.15s_ease-out]">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="w-full flex items-center gap-space-sm px-space-md py-space-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    New chat
                  </button>
                  <button
                    type="button"
                    onClick={handleClearConversation}
                    className="w-full flex items-center gap-space-sm px-space-md py-space-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                    Clear conversation
                  </button>
                </div>
              )}
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* ── Mood indicator ────────────────────────── */}
        {moodMeta && (
          <div className={`flex items-center gap-space-xs px-space-lg py-space-xs ${moodMeta.color} transition-all duration-500 shrink-0`}>
            <span className="text-[16px]">{moodMeta.emoji}</span>
            <span className="text-label-sm font-medium">{moodMeta.label}</span>
          </div>
        )}

        {/* ── Messages ──────────────────────────────── */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-space-md py-space-md space-y-space-md">

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mr-space-xs mt-1">
                  <img src="/unpack_logo.png" alt="" className="w-4 h-4 object-contain" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-space-md py-space-sm text-body-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-md'
                    : 'bg-surface-container-low text-on-surface rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Quick prompt suggestions — show only at start */}
          {messages.length <= 1 && !isTyping && (
            <div className="flex justify-start">
              <div className="w-7 shrink-0 mr-space-xs" />
              <div className="flex flex-wrap gap-2 max-w-[85%] animate-[fadeIn_0.4s_ease-out]">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickPrompt(prompt.text)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-low hover:bg-surface-container text-body-sm text-on-surface-variant hover:text-on-surface border border-outline-variant/30 hover:border-primary/40 transition-all duration-200 cursor-pointer hover:shadow-sm active:scale-[0.97]"
                  >
                    <span className="text-[14px]">{prompt.emoji}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mood-based recommendations (inline after messages) */}
          {recommendations && !showDistressCard && (
            <div className="flex justify-start">
              <div className="w-7 shrink-0 mr-space-xs" />
              <div className="bg-surface-container rounded-2xl rounded-bl-md px-space-md py-space-sm max-w-[80%]">
                <p className="text-label-sm font-bold text-on-surface-variant mb-space-xs">Try:</p>
                <div className="space-y-space-xs">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-space-xs">
                      <span className="text-[14px]">{rec.emoji}</span>
                      {rec.link ? (
                        <a
                          href={rec.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-sm text-primary hover:underline"
                        >
                          {rec.text}
                        </a>
                      ) : (
                        <span className="text-body-sm text-on-surface-variant">{rec.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Distress safety card */}
          {showDistressCard && (
            <div className="bg-error-container rounded-2xl p-space-lg shadow-md border border-error/20 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center gap-space-xs mb-space-sm">
                <span className="material-symbols-outlined text-on-error-container text-[22px]">emergency</span>
                <span className="text-label-lg font-bold text-on-error-container">You don't have to handle this alone.</span>
              </div>
              <p className="text-body-sm text-on-error-container mb-space-md leading-relaxed">
                If you feel like you might hurt yourself or you're in immediate danger, please contact local emergency services or someone you trust.
              </p>
              <div className="flex flex-col gap-space-xs">
                <a
                  href="tel:119"
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-error text-on-error text-label-md font-bold shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                  Into The Light — 119 ext 8
                </a>
                <button
                  type="button"
                  onClick={() => setShowDistressCard(false)}
                  className="inline-flex items-center justify-center gap-space-xs px-space-lg py-space-sm rounded-full bg-surface-container-lowest text-on-surface text-label-md font-medium hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Talk to Someone You Trust
                </button>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 mr-space-xs mt-1">
                <img src="/unpack_logo.png" alt="" className="w-4 h-4 object-contain" />
              </div>
              <div className="bg-surface-container-low rounded-2xl rounded-bl-md px-space-md py-space-sm flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-on-surface-variant/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex justify-center">
              <div className="bg-error-container text-on-error-container rounded-xl px-space-md py-space-xs text-body-sm flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>


        {/* ── Input bar ─────────────────────────────── */}
        <div className="shrink-0 border-t border-outline-variant/30 bg-surface-container-lowest px-space-md py-space-sm">
          {/* Input row */}
          <div className="flex items-end gap-space-xs">
            {/* Tips lightbulb button */}
            <button
              type="button"
              onClick={() => handleQuickPrompt('Berikan aku tips menjaga kesehatan mental hari ini')}
              disabled={isTyping}
              className="w-10 h-10 rounded-full bg-surface-container hover:bg-secondary-container text-on-surface-variant hover:text-on-secondary-container flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Mental health tips"
              title="Mental health tips"
            >
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type what's on your mind..."
              disabled={isTyping}
              rows={1}
              className="flex-1 bg-surface-container-low rounded-xl px-space-md py-space-sm text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all disabled:opacity-50 max-h-[120px]"
              style={{ minHeight: '42px' }}
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = 'auto';
                t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
              }}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
