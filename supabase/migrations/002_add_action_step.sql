-- ============================================
-- Add action_step column to baggage_items
-- ============================================
ALTER TABLE baggage_items
  ADD COLUMN action_step TEXT;

COMMENT ON COLUMN baggage_items.action_step IS 'One small concrete action step suggested by AI';
