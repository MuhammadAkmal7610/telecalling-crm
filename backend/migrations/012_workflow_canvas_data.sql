-- Migration 012: Add canvas_data to workflows table
-- This column will store ReactFlow nodes and edges for visual editing

ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS canvas_data JSONB DEFAULT '{"nodes": [], "edges": []}';

-- Add a comment to explain the purpose
COMMENT ON COLUMN workflows.canvas_data IS 'STORES ReactFlow JSON structure for visual workflow builder';
