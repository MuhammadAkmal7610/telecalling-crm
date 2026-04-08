-- ============================================================
-- Migration 022: Multiple Separate Pipelines
-- Adds 'pipelines' table and associates leads/stages to them
-- ============================================================

-- 1. Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipelines_org_ws ON pipelines(organization_id, workspace_id);
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;

-- 2. Add pipeline_id to lead_stages and leads
ALTER TABLE lead_stages ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lead_stages_pipeline ON lead_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(pipeline_id);

-- 3. Backfill: auto-create default pipeline for each existing workspace
INSERT INTO pipelines (organization_id, workspace_id, name, description, is_default)
SELECT organization_id, id, 'Default Pipeline', 'Main sales pipeline', true
FROM workspaces
WHERE id NOT IN (SELECT DISTINCT workspace_id FROM pipelines WHERE workspace_id IS NOT NULL);

-- 4. Backfill: set pipeline_id on existing lead_stages
UPDATE lead_stages SET pipeline_id = (
    SELECT id FROM pipelines 
    WHERE organization_id = lead_stages.organization_id 
    AND (workspace_id = lead_stages.workspace_id OR (workspace_id IS NULL AND lead_stages.workspace_id IS NULL))
    AND is_default = true 
    LIMIT 1
) WHERE pipeline_id IS NULL;

-- 5. Backfill: set pipeline_id on existing leads
UPDATE leads SET pipeline_id = (
    SELECT id FROM pipelines 
    WHERE organization_id = leads.organization_id 
    AND (workspace_id = leads.workspace_id OR (workspace_id IS NULL AND leads.workspace_id IS NULL))
    AND is_default = true 
    LIMIT 1
) WHERE pipeline_id IS NULL;

-- 6. RLS Policies — Pipelines
DROP POLICY IF EXISTS "ws_pipelines_access" ON pipelines;
CREATE POLICY "ws_pipelines_access" ON pipelines FOR ALL
  USING (
    workspace_id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid())
    OR organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin','root')
    )
  );
