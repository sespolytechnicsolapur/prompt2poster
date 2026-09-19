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
-- 3. Submissions table
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  poster_storage_path TEXT NOT NULL DEFAULT 'local-only',
  poster_url TEXT NOT NULL DEFAULT '',

  -- 7 Official AI Evaluation Criteria scores
  relevance_to_topic_score     INTEGER NOT NULL CHECK (relevance_to_topic_score     BETWEEN 0 AND 20),
  visual_hierarchy_score       INTEGER NOT NULL CHECK (visual_hierarchy_score       BETWEEN 0 AND 15),
  typography_readability_score INTEGER NOT NULL CHECK (typography_readability_score BETWEEN 0 AND 15),
  composition_layout_score     INTEGER NOT NULL CHECK (composition_layout_score     BETWEEN 0 AND 15),
  creativity_originality_score INTEGER NOT NULL CHECK (creativity_originality_score BETWEEN 0 AND 15),
  color_usage_score            INTEGER NOT NULL CHECK (color_usage_score            BETWEEN 0 AND 10),
  overall_communication_score  INTEGER NOT NULL CHECK (overall_communication_score  BETWEEN 0 AND 10),

  -- Calculated total (must equal sum of 7 criteria above, max 100)
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),

  -- AI Evaluation payload
  evaluation_reasoning JSONB NOT NULL DEFAULT '{}',
  issues               TEXT[] DEFAULT '{}',
  overall_evaluation   TEXT NOT NULL DEFAULT '',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS idx_submissions_total_score
  ON submissions (total_score DESC, created_at ASC);

-- ============================================================
-- 4. Row Level Security
-- ============================================================
ALTER TABLE topics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Topics policies
DROP POLICY IF EXISTS "Allow public read access to topics"     ON topics;
DROP POLICY IF EXISTS "Allow public insert/update to topics"   ON topics;
CREATE POLICY "Allow public read access to topics"   ON topics FOR SELECT USING (true);
CREATE POLICY "Allow public write access to topics"  ON topics FOR ALL    USING (true) WITH CHECK (true);

-- Topic Pool policies
DROP POLICY IF EXISTS "Allow public read access to topic_pool"  ON topic_pool;
DROP POLICY IF EXISTS "Allow public write access to topic_pool" ON topic_pool;
CREATE POLICY "Allow public read access to topic_pool"  ON topic_pool FOR SELECT USING (true);
CREATE POLICY "Allow public write access to topic_pool" ON topic_pool FOR ALL    USING (true) WITH CHECK (true);

-- Submissions policies
DROP POLICY IF EXISTS "Allow public read access to submissions" ON submissions;
DROP POLICY IF EXISTS "Allow public insert to submissions"      ON submissions;
CREATE POLICY "Allow public read access to submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to submissions"      ON submissions FOR INSERT WITH CHECK (true);

-- ============================================================
-- 5. Storage Bucket — posters (public)
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
