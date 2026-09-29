-- ============================================
-- Add duration_minutes column to baggage_items
-- ============================================
-- AI-estimated duration (in minutes) for the action step.
-- Default 10 for backward compatibility with existing items.

ALTER TABLE baggage_items
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 10;

COMMENT ON COLUMN baggage_items.duration_minutes IS 'AI-estimated duration in minutes for the action step (3-30 range, default 10)';
