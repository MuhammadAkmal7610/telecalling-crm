const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration: create scripts table...');

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
        CREATE TABLE IF NOT EXISTS scripts (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_scripts_org ON scripts(organization_id);

        -- Enable RLS
        ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;

        -- Policies
        -- Allow select/insert/update/delete for authenticated users in their own org
        -- (Simplified for migration purposes, actual policies might be more granular)
        `
    });

    if (error) {
        console.error('Migration failed:', error);
    } else {
        console.log('Migration completed successfully');
    }
}

runMigration();
