-- Add round_number to submissions
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1;

-- Add new rounds and qualification settings to topics
ALTER TABLE topics
ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS qualification_cutoff INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS show_qualification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_round_2 BOOLEAN DEFAULT false;

-- Update the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
