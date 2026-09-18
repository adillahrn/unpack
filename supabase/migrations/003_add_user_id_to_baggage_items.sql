-- ============================================
-- Add user_id column to baggage_items & update RLS
-- ============================================

-- 1. Add user_id column as NULLABLE initially
ALTER TABLE baggage_items
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill existing baggage_items from unloads table
UPDATE baggage_items
SET user_id = unloads.user_id
FROM unloads
WHERE baggage_items.unload_id = unloads.id
  AND baggage_items.user_id IS NULL;

-- 3. Set NOT NULL constraint after backfill
ALTER TABLE baggage_items
  ALTER COLUMN user_id SET NOT NULL;

-- 4. Enable RLS if not enabled
ALTER TABLE baggage_items ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to replace with direct user_id policies
DROP POLICY IF EXISTS "Users can view own baggage items" ON baggage_items;
DROP POLICY IF EXISTS "Users can create own baggage items" ON baggage_items;
DROP POLICY IF EXISTS "Users can update own baggage items" ON baggage_items;
DROP POLICY IF EXISTS "Users can delete own baggage items" ON baggage_items;

-- 6. Create direct user_id RLS policies
CREATE POLICY "Users can view own baggage items"
  ON baggage_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own baggage items"
  ON baggage_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own baggage items"
  ON baggage_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own baggage items"
  ON baggage_items FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Add index for fast querying by user_id
CREATE INDEX IF NOT EXISTS idx_baggage_items_user_id ON baggage_items(user_id);
