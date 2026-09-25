-- ============================================================
-- Prompt2Poster — Database Migration v2
-- ============================================================
-- Run this in your Supabase SQL Editor to upgrade the live database.
-- This script is SAFE to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- It does NOT drop or recreate any existing tables or data.
--
-- What this adds:
--   • contestants table (for Excel-imported login credentials)
--   • submissions.ai_prompt_used column
--   • submissions.is_hidden column
--   • submissions.score_edit_log column
--   • submissions.submitted_by_user_id column
--   • topics.leaderboard_visible column
--   • topics.topic_visible column
--   • Updated RLS policies for UPDATE/DELETE on submissions
-- ============================================================

-- ── 1. Contestants table (login credentials from Excel import) ──────────────
CREATE TABLE IF NOT EXISTS contestants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  unique_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contestants_user_id
  ON contestants (user_id);

-- ── 2. New columns on existing submissions table ────────────────────────────
-- These use DO blocks because ALTER TABLE ... ADD COLUMN IF NOT EXISTS
-- is not supported in all Postgres versions, but Supabase supports it.

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS submitted_by_user_id TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS ai_prompt_used TEXT DEFAULT '';
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_edit_log JSONB DEFAULT '[]';

-- Index for filtering hidden entries efficiently
CREATE INDEX IF NOT EXISTS idx_submissions_hidden
  ON submissions (is_hidden, total_score DESC);

-- ── 3. New columns on existing topics table ─────────────────────────────────
ALTER TABLE topics ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT true;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS topic_visible BOOLEAN DEFAULT true;

-- ── 4. RLS for contestants table ────────────────────────────────────────────
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to contestants"  ON contestants;
DROP POLICY IF EXISTS "Allow public write access to contestants" ON contestants;
CREATE POLICY "Allow public read access to contestants"  ON contestants FOR SELECT USING (true);
CREATE POLICY "Allow public write access to contestants" ON contestants FOR ALL    USING (true) WITH CHECK (true);

-- ── 5. Add UPDATE and DELETE policies to submissions (for admin ops) ────────
-- These are additive — existing SELECT and INSERT policies are untouched.
DROP POLICY IF EXISTS "Allow public update to submissions" ON submissions;
DROP POLICY IF EXISTS "Allow public delete to submissions" ON submissions;
CREATE POLICY "Allow public update to submissions" ON submissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete to submissions" ON submissions FOR DELETE USING (true);
