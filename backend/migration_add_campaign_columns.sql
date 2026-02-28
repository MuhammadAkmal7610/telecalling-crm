-- Migration: Add priority and updated_at to campaigns, and campaign_id to leads

-- Add missing columns to campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing campaign_id to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
