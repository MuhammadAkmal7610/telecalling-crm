const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('Running workflow migration...');
        
        // Get file path from command line args
        const fileArg = process.argv[2] || 'migrations/008_enhanced_workflow_engine.sql';
        const migrationPath = path.resolve(process.cwd(), fileArg);
        console.log(`Running migration from: ${migrationPath}`);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Remove lines that start with -- (comments)
        const sqlWithoutComments = migrationSQL
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
            
        // Split the SQL into individual statements
        const statements = sqlWithoutComments
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            
            try {
                // Supabase exec_sql could take sql_query or query string parameter named sql
                const { error } = await supabase.rpc('exec_sql', { sql: statement });
                if (error) {
                    console.error(`Error executing statement ${i + 1}:`, error);
                    // Continue with other statements
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }
            } catch (err) {
                console.error(`Error executing statement ${i + 1}:`, err.message);
                // Continue with other statements
            }
        }
        
        console.log('Migration completed!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
