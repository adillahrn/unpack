export type PaxState = 'idle' | 'thinking' | 'encouraging' | 'happy' | 'relieved';

export type BaggageCategory = 'academic' | 'deadline' | 'social' | 'personal' | 'health' | 'financial' | 'other';

export type Urgency = 'high' | 'medium' | 'low';

export type BaggageStatus = 'pending' | 'in_progress' | 'completed';

export type QuestStatus = 'pending' | 'in_progress' | 'completed';

export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface Unload {
  id: string;
  user_id: string;
  raw_text: string;
  created_at: string;
}

export interface BaggageItem {
  id: string;
  unload_id: string;
  title: string;
  category: BaggageCategory;
  urgency: Urgency;
  status: BaggageStatus;
  created_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  baggage_id: string;
  title: string;
  duration: number;
  xp: number;
  status: QuestStatus;
  created_at: string;
}

export interface UnpackResult {
  items: {
    title: string;
    category: BaggageCategory;
    urgency: Urgency;
  }[];
}

export interface QuestSuggestion {
  title: string;
  duration: number;
  xp: number;
}
