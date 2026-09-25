-- Prompt2Poster — Supabase SQL Schema
-- Run this entire script in your Supabase SQL Editor (Project → SQL Editor → New query)

-- ============================================================
-- 1. Topics table (single active topic)
-- ============================================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  leaderboard_visible BOOLEAN DEFAULT true,
  topic_visible BOOLEAN DEFAULT true,
  whitelist_enabled BOOLEAN DEFAULT false,
  current_round INTEGER DEFAULT 1,
  qualification_cutoff INTEGER DEFAULT 60,
  show_qualification BOOLEAN DEFAULT false,
  show_round_2 BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default topic only if table is empty
INSERT INTO topics (topic_title, description, is_active)
SELECT
  'AI for Renewable Energy & Climate Action',
  'Design an impactful poster illustrating how Artificial Intelligence can revolutionize solar, wind, and smart grid systems to combat climate change.',
  true
WHERE NOT EXISTS (SELECT 1 FROM topics);

-- ============================================================
-- 2. Topic Pool table (multi-topic random assignment)
-- ============================================================
CREATE TABLE IF NOT EXISTS topic_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. Contestants table (login credentials from Excel import)
-- ============================================================
CREATE TABLE IF NOT EXISTS contestants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id TEXT NOT NULL UNIQUE,
  unique_id TEXT NOT NULL,
  college_name TEXT DEFAULT '',
  is_whitelisted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contestants_user_id
  ON contestants (user_id);

-- ============================================================
-- 4. Submissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  round_number INTEGER DEFAULT 1,
  poster_storage_path TEXT NOT NULL DEFAULT 'local-only',
  poster_url TEXT NOT NULL DEFAULT '',

  -- Contestant login link
  submitted_by_user_id TEXT DEFAULT '',

  -- Optional chat screenshot from the AI tool used
  chat_screenshot_path TEXT DEFAULT '',
  chat_screenshot_url TEXT DEFAULT '',

  -- AI Prompt used by contestant to generate the poster
  ai_prompt_used TEXT DEFAULT '',

  -- 8 Official AI Evaluation Criteria scores
  relevance_to_topic_score     INTEGER NOT NULL CHECK (relevance_to_topic_score     BETWEEN 0 AND 20),
  visual_hierarchy_score       INTEGER NOT NULL CHECK (visual_hierarchy_score       BETWEEN 0 AND 15),
  typography_readability_score INTEGER NOT NULL CHECK (typography_readability_score BETWEEN 0 AND 10),
  composition_layout_score     INTEGER NOT NULL CHECK (composition_layout_score     BETWEEN 0 AND 15),
  creativity_originality_score INTEGER NOT NULL CHECK (creativity_originality_score BETWEEN 0 AND 15),
  color_usage_score            INTEGER NOT NULL CHECK (color_usage_score            BETWEEN 0 AND 10),
  overall_communication_score  INTEGER NOT NULL CHECK (overall_communication_score  BETWEEN 0 AND 5),
  prompt_authenticity_score    INTEGER NOT NULL CHECK (prompt_authenticity_score    BETWEEN 0 AND 10),

  -- Calculated total (must equal sum of 8 criteria above, max 100)
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),

  -- AI Evaluation payload
  evaluation_reasoning JSONB NOT NULL DEFAULT '{}',
  issues               TEXT[] DEFAULT '{}',
  overall_evaluation   TEXT NOT NULL DEFAULT '',

  -- Admin controls
  is_hidden BOOLEAN DEFAULT false,
  score_edit_log JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_submissions_total_score
  ON submissions (total_score DESC, created_at ASC);

-- Index for filtering hidden entries
CREATE INDEX IF NOT EXISTS idx_submissions_hidden
  ON submissions (is_hidden, total_score DESC);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
ALTER TABLE topics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_pool  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contestants ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Topics policies
DROP POLICY IF EXISTS "Allow public read access to topics"     ON topics;
DROP POLICY IF EXISTS "Allow public write access to topics"    ON topics;
CREATE POLICY "Allow public read access to topics"  ON topics FOR SELECT USING (true);
CREATE POLICY "Allow public write access to topics" ON topics FOR ALL    USING (true) WITH CHECK (true);

-- Topic Pool policies
DROP POLICY IF EXISTS "Allow public read access to topic_pool"  ON topic_pool;
DROP POLICY IF EXISTS "Allow public write access to topic_pool" ON topic_pool;
CREATE POLICY "Allow public read access to topic_pool"  ON topic_pool FOR SELECT USING (true);
CREATE POLICY "Allow public write access to topic_pool" ON topic_pool FOR ALL    USING (true) WITH CHECK (true);

-- Contestants policies
DROP POLICY IF EXISTS "Allow public read access to contestants"  ON contestants;
DROP POLICY IF EXISTS "Allow public write access to contestants" ON contestants;
CREATE POLICY "Allow public read access to contestants"  ON contestants FOR SELECT USING (true);
CREATE POLICY "Allow public write access to contestants" ON contestants FOR ALL    USING (true) WITH CHECK (true);

-- Submissions policies (full CRUD for admin operations)
DROP POLICY IF EXISTS "Allow public read access to submissions"  ON submissions;
DROP POLICY IF EXISTS "Allow public insert to submissions"       ON submissions;
DROP POLICY IF EXISTS "Allow public update to submissions"       ON submissions;
DROP POLICY IF EXISTS "Allow public delete to submissions"       ON submissions;
CREATE POLICY "Allow public read access to submissions"  ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to submissions"       ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to submissions"       ON submissions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete to submissions"       ON submissions FOR DELETE USING (true);

-- ============================================================
-- 6. Storage Bucket — posters (public)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (SELECT + INSERT + UPDATE for upsert support)
DROP POLICY IF EXISTS "Public Read Access for Posters"   ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access for Posters" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access for Posters" ON storage.objects;

CREATE POLICY "Public Read Access for Posters"
  ON storage.objects FOR SELECT USING (bucket_id = 'posters');

CREATE POLICY "Public Insert Access for Posters"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posters');

-- Required for upsert: true in the upload call
CREATE POLICY "Public Update Access for Posters"
  ON storage.objects FOR UPDATE USING (bucket_id = 'posters') WITH CHECK (bucket_id = 'posters');

-- ============================================================
-- 7. Postgres RPC Functions
-- ============================================================
-- Used to atomically append items to the JSONB score_edit_log array
CREATE OR REPLACE FUNCTION append_score_edit_log(
  submission_id UUID,
  new_entry JSONB
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE submissions
  SET score_edit_log = COALESCE(score_edit_log, '[]'::jsonb) || jsonb_build_array(new_entry)
  WHERE id = submission_id;
END;
$$;
