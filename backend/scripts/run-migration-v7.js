const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runMigration() {
    console.log('Starting migration v7: Add workspace_id to activities...');

    // 1. Add workspace_id column
    const { error: addColumnError } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE activities ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;`
    });

    if (addColumnError) {
        // Fallback if rpc exec_sql is not available
        console.warn('exec_sql RPC failed, trying direct query (this might fail if not using service role properly in some environments):', addColumnError.message);
    }

    // 2. Backfill workspace_id from leads table
    const { error: backfillError } = await supabase.rpc('exec_sql', {
        sql: `
            UPDATE activities
            SET workspace_id = leads.workspace_id
            FROM leads
            WHERE activities.lead_id = leads.id
            AND activities.workspace_id IS NULL;
        `
    });

    if (backfillError) {
        console.error('Error backfilling workspace_id:', backfillError.message);
    } else {
        console.log('Backfilled workspace_id for existing activities.');
    }

    // 3. Create index
    const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: `CREATE INDEX IF NOT EXISTS idx_activities_workspace ON activities(workspace_id);`
    });

    if (indexError) {
        console.error('Error creating index:', indexError.message);
    } else {
        console.log('Created index on activities(workspace_id).');
    }

    console.log('Migration v7 completed.');
}

runMigration().catch(console.error);
