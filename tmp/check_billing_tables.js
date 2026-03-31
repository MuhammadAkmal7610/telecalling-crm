const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['billing_subscriptions', 'transactions', 'organization_billing_info', 'organizations'];
    console.log('Checking tables...');
    
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table [${table}] Error: ${error.message} (${error.code})`);
        } else {
            console.log(`Table [${table}] EXISTS.`);
        }
    }
}

checkTables();
