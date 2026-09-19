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

/**
 * Sends a message to PAX and returns the AI response with mood + distress info.
 */
export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
): Promise<ChatResponse> {
  const { data, error } = await supabase.functions.invoke('pax-chat', {
    body: { message: message.trim(), history },
  });

  if (error) {
    console.error('pax-chat error:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Gagal terhubung ke server. Coba lagi.');
    }
    
    // Try to extract the backend error message if available
    let backendMsg = 'Terjadi kesalahan. Coba lagi nanti.';
    try {
      if (typeof error === 'object' && error !== null) {
        // Sometimes Supabase error contains context
        if ('context' in error) {
          const ctx = error.context as any;
          if (ctx && typeof ctx.json === 'function') {
            const body = await ctx.json().catch(() => ({}));
            if (body.error) backendMsg = `Server: ${body.error}`;
          }
        } else if ('message' in error && error.message) {
           backendMsg = `Error: ${error.message}`;
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
    
    throw new Error(backendMsg);
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

/**
 * Creates a unique message ID.
 */
export function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
