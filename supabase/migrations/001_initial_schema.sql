-- ============================================
-- UNPACK — Initial Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- UNLOADS (Mind Dumps)
-- ============================================
CREATE TABLE unloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE unloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unloads"
  ON unloads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own unloads"
  ON unloads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own unloads"
  ON unloads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- BAGGAGE ITEMS
-- ============================================
CREATE TABLE baggage_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unload_id UUID NOT NULL REFERENCES unloads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('academic', 'deadline', 'social', 'personal', 'health', 'financial', 'other')),
  urgency TEXT NOT NULL CHECK (urgency IN ('high', 'medium', 'low')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE baggage_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baggage items"
  ON baggage_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM unloads
      WHERE unloads.id = baggage_items.unload_id
      AND unloads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own baggage items"
  ON baggage_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM unloads
      WHERE unloads.id = baggage_items.unload_id
      AND unloads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own baggage items"
  ON baggage_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM unloads
      WHERE unloads.id = baggage_items.unload_id
      AND unloads.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own baggage items"
  ON baggage_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM unloads
      WHERE unloads.id = baggage_items.unload_id
      AND unloads.user_id = auth.uid()
    )
  );

-- ============================================
-- QUESTS
-- ============================================
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  baggage_id UUID NOT NULL REFERENCES baggage_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 10,
  xp INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quests"
  ON quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
  ON quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
  ON quests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
  ON quests FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_unloads_user_id ON unloads(user_id);
CREATE INDEX idx_baggage_items_unload_id ON baggage_items(unload_id);
CREATE INDEX idx_baggage_items_status ON baggage_items(status);
CREATE INDEX idx_quests_user_id ON quests(user_id);
CREATE INDEX idx_quests_baggage_id ON quests(baggage_id);
CREATE INDEX idx_quests_status ON quests(status);
