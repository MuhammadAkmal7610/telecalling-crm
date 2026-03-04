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
    console.log('Running migration v6: Adding workspace_id to lead_stages and lost_reasons...');

    const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: `
            -- 1. Add workspace_id column
            ALTER TABLE public.lead_stages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
            ALTER TABLE public.lost_reasons ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

            -- 2. Try to backfill workspace_id from organizations' default workspace
            UPDATE public.lead_stages ls
            SET workspace_id = w.id
            FROM public.workspaces w
            WHERE ls.organization_id = w.organization_id 
            AND w.is_default = true
            AND ls.workspace_id IS NULL;

            UPDATE public.lost_reasons lr
            SET workspace_id = w.id
            FROM public.workspaces w
            WHERE lr.organization_id = w.organization_id 
            AND w.is_default = true
            AND lr.workspace_id IS NULL;

            -- 3. Create indexes
            CREATE INDEX IF NOT EXISTS idx_lead_stages_workspace ON public.lead_stages(workspace_id);
            CREATE INDEX IF NOT EXISTS idx_lost_reasons_workspace ON public.lost_reasons(workspace_id);
        `
    });

    if (error1) {
        console.error('Migration failed. You might need to run the following SQL in Supabase Dashboard:');
        console.log(`
            ALTER TABLE public.lead_stages ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
            ALTER TABLE public.lost_reasons ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
            
            UPDATE public.lead_stages ls
            SET workspace_id = (SELECT id FROM public.workspaces WHERE organization_id = ls.organization_id AND is_default = true LIMIT 1)
            WHERE workspace_id IS NULL;

            UPDATE public.lost_reasons lr
            SET workspace_id = (SELECT id FROM public.workspaces WHERE organization_id = lr.organization_id AND is_default = true LIMIT 1)
            WHERE workspace_id IS NULL;

            CREATE INDEX IF NOT EXISTS idx_lead_stages_workspace ON public.lead_stages(workspace_id);
            CREATE INDEX IF NOT EXISTS idx_lost_reasons_workspace ON public.lost_reasons(workspace_id);
        `);
    } else {
        console.log('Migration v6 completed successfully!');
    }
}

runMigration().catch(err => {
    console.error('Migration execution error:', err);
});
