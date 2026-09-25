-- Add qualification_override to submissions
ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS qualification_override TEXT DEFAULT 'auto';

-- Update the schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
