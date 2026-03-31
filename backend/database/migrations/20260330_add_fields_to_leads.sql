-- Migration: Add company and alt_phone columns to leads table
-- Run this in your Supabase SQL Editor

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company TEXT;

ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS alt_phone TEXT;

-- Optional: Update existing lead field definitions to include company
-- This is handled automatically by the updated backend for new organizations,
-- but for existing ones, you can run:

INSERT INTO lead_field_definitions (organization_id, name, label, type, is_default, position)
SELECT DISTINCT organization_id, 'company', 'Company', 'text', true, 6
FROM lead_field_definitions
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO lead_field_definitions (organization_id, name, label, type, is_default, position)
SELECT DISTINCT organization_id, 'alt_phone', 'Alt Phone', 'tel', true, 5
FROM lead_field_definitions
ON CONFLICT (organization_id, name) DO NOTHING;
