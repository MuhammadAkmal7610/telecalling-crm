-- Migration 005: Autodistribution & Webhook Security

-- 1. Add webhook_token to organizations for secure public access
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS webhook_token UUID DEFAULT uuid_generate_v4();
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_webhook_token ON organizations(webhook_token);

-- 2. Add round_robin_index to workflows to track assignment state
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS round_robin_index INTEGER DEFAULT 0;

-- 3. Add workspace_id to workflows if missing (scoped automations)
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace_id);
