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
    console.log('Running migration v5: Adding round_robin_index and workspace_id to workflows...');

    const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: `
            ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS round_robin_index INTEGER DEFAULT 0;
            ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
        `
    });

    if (error1) {
        console.error('Migration failed. You might need to run the following SQL in Supabase Dashboard:');
        console.log(`
            ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS round_robin_index INTEGER DEFAULT 0;
            ALTER TABLE public.workflows ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
            CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON public.workflows(workspace_id);
        `);
    } else {
        console.log('Migration v5 completed successfully!');
    }
}

runMigration().catch(err => {
    console.error('Migration execution error:', err);
});
