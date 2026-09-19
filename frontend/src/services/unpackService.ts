import { supabase } from '@/lib/supabaseClient';

export interface BaggageItem {
  title: string;
  category: 'academic' | 'deadline' | 'social' | 'personal' | 'health' | 'financial' | 'other';
  urgency: 'high' | 'medium' | 'low';
  actionStep: string;
}

export interface UnpackResult {
  items: BaggageItem[];
  unloadId: string;
}

export interface UnpackState {
  isLoading: boolean;
  error: string | null; // i18n key
  data: UnpackResult | null;
}

export const initialUnpackState: UnpackState = {
  isLoading: false,
  error: null,
  data: null,
};

/**
 * Calls the "unpack" edge function to process a mind dump.
 * Creates an unload record first, then invokes the AI function.
 */
export async function unpackMindDump(rawText: string): Promise<UnpackResult> {
  // Validate input
  const trimmed = rawText.trim();
  if (!trimmed) {
    throw new UnpackError('unpack.error.empty');
  }

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Auth error or no user:', authError);
    throw new UnpackError('unpack.error.auth');
  }

  // Create an unload record first
  const { data: unload, error: unloadError } = await supabase
    .from('unloads')
    .insert({ user_id: user.id, raw_text: trimmed })
    .select('id')
    .single();

  if (unloadError || !unload) {
    console.error('Failed to create unload:', unloadError);
    throw new UnpackError('unpack.error.server');
  }

  // Call the edge function
  const { data, error } = await supabase.functions.invoke('unpack', {
    body: { raw_text: trimmed, unload_id: unload.id },
  });

  if (error) {
    console.error('Edge function error:', error);
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new UnpackError('unpack.error.network');
    }
    throw new UnpackError('unpack.error.server');
  }

  if (!data || !Array.isArray(data.items) || data.items.length === 0) {
    throw new UnpackError('unpack.error.parse');
  }

  // Check for errorKey from edge function
  if (data.errorKey) {
    throw new UnpackError(data.errorKey);
  }

  return { items: data.items, unloadId: unload.id };
}

/**
 * Custom error class that carries an i18n key for display.
 */
export class UnpackError extends Error {
  public readonly i18nKey: string;

  constructor(i18nKey: string) {
    super(i18nKey);
    this.name = 'UnpackError';
    this.i18nKey = i18nKey;
  }
}
