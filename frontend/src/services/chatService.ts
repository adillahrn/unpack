import { supabase } from '@/lib/supabaseClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MoodResult {
  label: 'happy' | 'sad' | 'anxious' | 'calm' | 'energized';
  confidence: number;
}

export interface ChatResponse {
  reply: string;
  mood: MoodResult;
  distress: boolean;
}

// Client-side distress keyword scanner (first layer — immediate, no API delay)
const DISTRESS_KEYWORDS_ID = [
  'bunuh diri', 'menyakiti diri', 'ingin mati', 'tidak sanggup lagi',
  'nggak sanggup', 'gak sanggup', 'akhiri hidup', 'akhiri semuanya',
  'mau mati', 'lebih baik mati', 'hidup tidak ada artinya',
  'tidak ada gunanya hidup', 'sakiti diriku', 'menyakiti diriku',
  'potong nadi', 'gantung diri', 'lompat dari',
];

const DISTRESS_KEYWORDS_EN = [
  'kill myself', 'hurt myself', 'want to die', 'end my life',
  'end it all', 'better off dead', 'suicide', 'self-harm',
  'self harm', 'slit my wrist', 'hang myself', 'jump off',
  'no reason to live', 'not worth living', 'can\'t go on',
];

const ALL_DISTRESS_KEYWORDS = [...DISTRESS_KEYWORDS_ID, ...DISTRESS_KEYWORDS_EN];

/**
 * Client-side distress scan — runs before the API call for immediate detection.
 */
export function scanForDistress(message: string): boolean {
  const lower = message.toLowerCase();
  return ALL_DISTRESS_KEYWORDS.some((kw) => lower.includes(kw));
}

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 5_000; // 5 seconds base

/**
 * Extracts a retry delay (in ms) from the error, falling back to exponential backoff.
 */
function getRetryDelay(errorMsg: string, attempt: number): number {
  // Try to parse "retry in Xs" from the Gemini error message
  const match = errorMsg.match(/retry\s+in\s+([\d.]+)s/i);
  if (match) {
    return Math.ceil(parseFloat(match[1]) * 1000) + 500; // add 500ms buffer
  }
  // Exponential backoff: 5s, 10s, 20s
  return BASE_RETRY_DELAY_MS * Math.pow(2, attempt);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Checks if the error is a rate-limit (429) error.
 */
function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const msg = (error as any).message ?? '';
  return msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');
}

/**
 * Sends a message to PAX and returns the AI response with mood + distress info.
 * Includes automatic retry with backoff for rate-limit (429) errors.
 */
export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
): Promise<ChatResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const { data, error } = await supabase.functions.invoke('pax-chat', {
      body: { message: message.trim(), history },
    });

    if (error) {
      console.error(`pax-chat error (attempt ${attempt + 1}):`, error);

      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Gagal terhubung ke server. Periksa koneksi internetmu.');
      }

      // Extract backend error message
      let backendMsg = '';
      try {
        if (typeof error === 'object' && error !== null) {
          if ('context' in error) {
            const ctx = error.context as any;
            if (ctx && typeof ctx.json === 'function') {
              const body = await ctx.json().catch(() => ({}));
              if (body.error) backendMsg = body.error;
            }
          }
          if (!backendMsg && 'message' in error && error.message) {
            backendMsg = error.message;
          }
        }
      } catch {
        // Ignore parsing errors
      }

      // If rate-limited and we still have retries, wait and retry
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        const delay = getRetryDelay(backendMsg || error.message || '', attempt);
        console.log(`Rate limited — retrying in ${Math.round(delay / 1000)}s (attempt ${attempt + 2}/${MAX_RETRIES + 1})`);
        await sleep(delay);
        continue;
      }

      // Format user-friendly error messages
      if (isRateLimitError(error)) {
        throw new Error('PAX sedang sibuk. Coba lagi dalam beberapa menit ya 🙏');
      }

      lastError = new Error(backendMsg || 'Terjadi kesalahan. Coba lagi nanti.');
      break;
    }

    if (!data || typeof data.reply !== 'string') {
      throw new Error('Respons tidak valid dari PAX.');
    }

    return {
      reply: data.reply,
      mood: data.mood ?? { label: 'calm', confidence: 0.5 },
      distress: data.distress ?? false,
    };
  }

  throw lastError ?? new Error('Terjadi kesalahan. Coba lagi nanti.');
}

/**
 * Creates a unique message ID.
 */
export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
