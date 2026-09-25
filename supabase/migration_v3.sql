ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS prompt_authenticity_score INTEGER NOT NULL DEFAULT 0 CHECK (prompt_authenticity_score BETWEEN 0 AND 10);

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_typography_readability_score_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_typography_readability_score_check CHECK (typography_readability_score BETWEEN 0 AND 10);

ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_overall_communication_score_check;
ALTER TABLE submissions ADD CONSTRAINT submissions_overall_communication_score_check CHECK (overall_communication_score BETWEEN 0 AND 5);
