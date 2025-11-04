-- Add language_code column to captions table
ALTER TABLE captions ADD COLUMN IF NOT EXISTS language_code TEXT;

-- Create index on language_code for potential filtering/grouping
CREATE INDEX IF NOT EXISTS idx_captions_language_code ON captions(language_code);

