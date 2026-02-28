-- Migration Fix Part 2: Add progress and assignee_ids to campaigns

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';
