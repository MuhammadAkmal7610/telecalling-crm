const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    console.log('Running migration: Creating api_templates table...');

    const sql = `
        -- Create api_templates table
        CREATE TABLE IF NOT EXISTS public.api_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            method TEXT DEFAULT 'POST',
            variables JSONB DEFAULT '[]'::jsonb,
            headers JSONB DEFAULT '{}'::jsonb,
            workflow_id UUID REFERENCES public.workflows(id) ON DELETE SET NULL,
            workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
            organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
            created_by UUID REFERENCES public.users(id),
            created_at TIMESTAMPTZ DEFAULT now(),
            updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Add RLS (Row Level Security) - Simplified for admin access from backend
        ALTER TABLE public.api_templates ENABLE ROW LEVEL SECURITY;

        -- Create index for workspace-based performance
        CREATE INDEX IF NOT EXISTS idx_api_templates_workspace ON public.api_templates(workspace_id);

        -- Insert dummy record for UI testing
        INSERT INTO public.api_templates (name, endpoint, variables, organization_id, workspace_id)
        SELECT 'Telecrm Facebook Api', 'https://graph.facebook.com/v23.0/5332060898...', '["status", "phone"]', 
               (SELECT id FROM public.organizations LIMIT 1), 
               (SELECT id FROM public.workspaces LIMIT 1)
        WHERE NOT EXISTS (SELECT 1 FROM public.api_templates WHERE name = 'Telecrm Facebook Api');
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Migration failed. Error:', error.message);
        console.log('\nIf "exec_sql" RPC is missing, please run the SQL below in Supabase Dashboard SQL Editor:\n');
        console.log(sql);
    } else {
        console.log('Migration completed successfully! api_templates table is ready.');
    }
}

runMigration().catch(err => {
    console.error('Migration execution error:', err);
});
