const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runWhatsAppMigration() {
    try {
        console.log('Reading migration_whatsapp_telephony.sql...');
        const migrationSQL = fs.readFileSync('migration_whatsapp_telephony.sql', 'utf8');
        
        // Split by semicolon (approximate, better than nothing)
        const statements = migrationSQL
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        console.log(`Executing ${statements.length} SQL statements...`);

        for (let i = 0; i < statements.length; i++) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: statements[i] });
            if (error) {
                // If exec_sql fails, it might be because the RPC doesn't exist.
                // In that case, we should advise the user to run it in the dashboard.
                if (error.message.includes('function "exec_sql" does not exist')) {
                    console.error('\nERROR: The "exec_sql" function does not exist in your Supabase project.');
                    console.error('Please copy the contents of "migration_whatsapp_telephony.sql" and run it manually in the Supabase SQL Editor.');
                    return;
                }
                console.error(`Error in statement ${i + 1}:`, error.message);
            } else {
                process.stdout.write('.');
            }
        }
        console.log('\nMigration finished!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

runWhatsAppMigration();
