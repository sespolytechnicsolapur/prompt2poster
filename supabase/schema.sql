-- Prompt2Poster — Supabase SQL Schema
-- Run this script in your Supabase SQL Editor

-- 1. Create active competition topic table
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Insert initial default competition topic
INSERT INTO topics (topic_title, description, is_active)
VALUES (
  'AI for Renewable Energy & Climate Action',
  'Design an impactful poster illustrating how Artificial Intelligence can revolutionize solar, wind, and smart grid systems to combat climate change.',
  true
)
ON CONFLICT DO NOTHING;

-- 3. Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contestant_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  poster_storage_path TEXT NOT NULL,
  poster_url TEXT NOT NULL,
  
  -- 7 Official AI Evaluation Criteria
  relevance_to_topic_score INTEGER NOT NULL CHECK (relevance_to_topic_score BETWEEN 0 AND 20),
  visual_hierarchy_score INTEGER NOT NULL CHECK (visual_hierarchy_score BETWEEN 0 AND 15),
  typography_readability_score INTEGER NOT NULL CHECK (typography_readability_score BETWEEN 0 AND 15),
  composition_layout_score INTEGER NOT NULL CHECK (composition_layout_score BETWEEN 0 AND 15),
  creativity_originality_score INTEGER NOT NULL CHECK (creativity_originality_score BETWEEN 0 AND 15),
  color_usage_score INTEGER NOT NULL CHECK (color_usage_score BETWEEN 0 AND 10),
  overall_communication_score INTEGER NOT NULL CHECK (overall_communication_score BETWEEN 0 AND 10),
  
  -- Calculated Total Score (Sum of above = max 100)
  total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
  
  -- AI Evaluation details
  evaluation_reasoning JSONB NOT NULL,
  issues TEXT[] DEFAULT '{}',
  overall_evaluation TEXT NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for leaderboard queries sorted by score descending
CREATE INDEX IF NOT EXISTS idx_submissions_total_score ON submissions(total_score DESC, created_at ASC);

-- Enable Row Level Security (RLS)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Allow public read access to topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update to topics" ON topics FOR ALL USING (true);

CREATE POLICY "Allow public read access to submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow public insert to submissions" ON submissions FOR INSERT WITH CHECK (true);

-- 4. Storage Bucket Setup Instructions
-- In the Supabase Dashboard -> Storage:
-- Create a public bucket named 'posters'
-- SQL to enable public access to storage.objects for posters bucket:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Read Access for Posters" ON storage.objects 
FOR SELECT USING (bucket_id = 'posters');

CREATE POLICY "Public Insert Access for Posters" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'posters');
