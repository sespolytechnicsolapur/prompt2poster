-- Prompt2Poster — Migration v4: Add college_name to contestants
-- Run this in your Supabase SQL Editor (Project → SQL Editor → New query)

-- Add college_name column to contestants table
ALTER TABLE contestants ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT '';

-- Add college_name column to submissions table (for admin reference)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS college_name TEXT DEFAULT '';
