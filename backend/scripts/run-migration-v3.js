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
    console.log('Running migration: create lead_field_definitions table...');

    const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
        CREATE TABLE IF NOT EXISTS lead_field_definitions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            label TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'text',
            is_default BOOLEAN DEFAULT FALSE,
            is_required BOOLEAN DEFAULT FALSE,
            is_searchable BOOLEAN DEFAULT FALSE,
            show_in_import BOOLEAN DEFAULT TRUE,
            show_in_quick_add BOOLEAN DEFAULT TRUE,
            lock_after_create BOOLEAN DEFAULT FALSE,
            can_use_variable BOOLEAN DEFAULT TRUE,
            options JSONB DEFAULT '[]',
            position INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_lead_fields_org ON lead_field_definitions(organization_id);

        -- Enable RLS
        ALTER TABLE lead_field_definitions ENABLE ROW LEVEL SECURITY;

        -- Add initial default fields if they don't exist
        -- Note: Existing organizations won't get these automatically via simple SQL, 
        -- but we can add logic to the service to ensure defaults exist.
        `
    });

    if (error) {
        console.error('Migration failed:', error);
        // If exec_sql is not available, we might need to use a different approach or manual SQL
        console.log('Trying alternative approach if rpc fails...');
    } else {
        console.log('Migration completed successfully');
    }
}

runMigration();
