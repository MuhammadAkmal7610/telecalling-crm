-- Migration: Add calls table and telephony features
-- This migration adds the necessary tables and columns for the telephony and reporting features

-- Create calls table if it doesn't exist
CREATE TABLE IF NOT EXISTS calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Call details
    status TEXT DEFAULT 'initiated' CHECK (status IN ('initiated', 'connected', 'missed', 'voicemail', 'ended')),
    duration INTEGER DEFAULT 0,
    call_status TEXT, -- Connected, Not Interested, Follow Up, Wrong Number, etc.
    
    -- Recording and transcript
    recording_url TEXT,
    transcript TEXT,
    notes TEXT,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_calls_workspace_id ON calls(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);

-- Update existing tasks table with missing columns if needed
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Todo';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add lead_stage_id to leads table if it doesn't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES lead_stages(id) ON DELETE SET NULL;

-- Add value column to leads table for deal value tracking
ALTER TABLE leads ADD COLUMN IF NOT EXISTS value DECIMAL(12,2) DEFAULT 0;

-- Add call_count and total_call_duration to leads for analytics
ALTER TABLE leads ADD COLUMN IF NOT EXISTS call_count INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS total_call_duration INTEGER DEFAULT 0;

-- Create call_analytics table for pre-computed analytics
CREATE TABLE IF NOT EXISTS call_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Date dimensions
    date DATE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('day', 'week', 'month', 'year')),
    
    -- Metrics
    total_calls INTEGER DEFAULT 0,
    connected_calls INTEGER DEFAULT 0,
    missed_calls INTEGER DEFAULT 0,
    voicemail_calls INTEGER DEFAULT 0,
    total_talk_time INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(workspace_id, date, period_type)
);

-- Create indexes for call_analytics
CREATE INDEX IF NOT EXISTS idx_call_analytics_workspace_date ON call_analytics(workspace_id, date);
CREATE INDEX IF NOT EXISTS idx_call_analytics_period ON call_analytics(period_type);

-- Add RLS (Row Level Security) policies for calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'calls' AND policyname = 'Users can view calls in their workspace'
    ) THEN
        CREATE POLICY "Users can view calls in their workspace" ON calls
            FOR SELECT USING (
                workspace_id IN (
                    SELECT id FROM workspaces WHERE 
                    id = current_setting('app.current_workspace_id')::UUID
                )
            );
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'calls' AND policyname = 'Users can insert calls in their workspace'
    ) THEN
        CREATE POLICY "Users can insert calls in their workspace" ON calls
            FOR INSERT WITH CHECK (
                workspace_id = current_setting('app.current_workspace_id')::UUID
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'calls' AND policyname = 'Users can update calls in their workspace'
    ) THEN
        CREATE POLICY "Users can update calls in their workspace" ON calls
            FOR UPDATE USING (
                workspace_id = current_setting('app.current_workspace_id')::UUID
            );
    END IF;
END $$;

-- Add RLS for call_analytics
ALTER TABLE call_analytics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'call_analytics' AND policyname = 'Users can view analytics in their workspace'
    ) THEN
        CREATE POLICY "Users can view analytics in their workspace" ON call_analytics
            FOR SELECT USING (
                workspace_id IN (
                    SELECT id FROM workspaces WHERE 
                    id = current_setting('app.current_workspace_id')::UUID
                )
            );
    END IF;
END $$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_calls_updated_at ON calls;
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON calls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_call_analytics_updated_at ON call_analytics;
CREATE TRIGGER update_call_analytics_updated_at BEFORE UPDATE ON call_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON calls TO authenticated;
GRANT ALL ON call_analytics TO authenticated;

-- Create view for call summary reports
CREATE OR REPLACE VIEW call_summary_view AS
SELECT 
    w.id as workspace_id,
    w.name as workspace_name,
    DATE_TRUNC('day', c.created_at) as call_date,
    COUNT(*) as total_calls,
    COUNT(CASE WHEN c.status = 'connected' THEN 1 END) as connected_calls,
    COUNT(CASE WHEN c.status = 'missed' THEN 1 END) as missed_calls,
    COUNT(CASE WHEN c.status = 'voicemail' THEN 1 END) as voicemail_calls,
    SUM(c.duration) as total_talk_time,
    AVG(c.duration) as avg_call_duration
FROM calls c
JOIN workspaces w ON c.workspace_id = w.id
GROUP BY w.id, w.name, DATE_TRUNC('day', c.created_at);

COMMENT ON TABLE calls IS 'Stores all call records including recordings and analytics';
COMMENT ON TABLE call_analytics IS 'Pre-computed analytics for faster reporting';
COMMENT ON VIEW call_summary_view IS 'Daily call summary for reporting';
