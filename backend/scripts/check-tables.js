const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listTables() {
  const { data, error } = await supabase
    .from('_prisma_migrations') // Check if prisma migrations exist first or just query information_schema
    .select('id');
    
  // A better way to search for tables without knowing them is to use RPC or a raw query if enabled
  // But let's try to query the common names
  const commonTables = ['lists', 'lead_lists', 'workspaces', 'leads', 'users', 'activities'];
  for (const table of commonTables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`Table found: ${table}`);
    } else {
       if (error.code !== '42P01') { // 42P01 is undefined_table
         console.log(`Table ${table} error: ${error.message}`);
       }
    }
  }
}

listTables();
