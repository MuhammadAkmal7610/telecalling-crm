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
    console.log('Running migration v4: Adding campaign_id and rating to leads...');

    // Add campaign_id to leads
    const { error: error1 } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;`
    });

    if (error1) {
        // If exec_sql fails, try direct query via REST (might not work for DDL depending on permissions)
        console.warn('exec_sql failed, trying alternative...', error1.message);

        // Alternative: Use an admin client to run raw SQL if possible, but Supabase JS doesn't support raw SQL easily without RPC.
        // We'll try to use the migration function if it exists.
    }

    // Add rating to leads
    const { error: error2 } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;`
    });

    if (error1 || error2) {
        console.error('Migration failed. You might need to run the following SQL in Supabase Dashboard:');
        console.log(`
            ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;
            ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;
            CREATE INDEX IF NOT EXISTS idx_leads_campaign ON public.leads(campaign_id);
        `);
    } else {
        console.log('Migration v4 completed successfully!');
    }
}

runMigration().catch(err => {
    console.error('Migration execution error:', err);
});
