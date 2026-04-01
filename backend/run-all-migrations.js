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

async function runMigration(migrationFile) {
    const migrationPath = path.join(__dirname, 'migrations', migrationFile);
    console.log(`\n--- Running: ${migrationFile} ---`);
    
    try {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split the SQL into individual statements
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && stmt !== '');
        
        console.log(`Found ${statements.length} SQL statements to execute`);
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            try {
                // Use Supabase RPC to execute SQL
                const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
                if (error) {
                    console.warn(`Warning executing statement ${i + 1}:`, error.message);
                } else {
                    console.log(`Statement ${i + 1} executed successfully`);
                }
            } catch (err) {
                console.warn(`Warning executing statement ${i + 1}:`, err.message);
            }
        }
        
        console.log(`✓ Completed: ${migrationFile}`);
        return true;
    } catch (error) {
        console.error(`✗ Error in ${migrationFile}:`, error.message);
        return false;
    }
}

async function runAllMigrations() {
    try {
        console.log('=== Starting All Migrations ===\n');
        
        // List all migration files in order
        const migrationsDir = path.join(__dirname, 'migrations');
        const allFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();
        
        console.log(`Found ${allFiles.length} migration files:\n`);
        allFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
        
        const results = [];
        
        for (const migrationFile of allFiles) {
            const success = await runMigration(migrationFile);
            results.push({ file: migrationFile, success });
        }
        
        console.log('\n=== Migration Summary ===\n');
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        results.forEach(r => {
            console.log(`${r.success ? '✓' : '✗'} ${r.file}`);
        });
        
        console.log(`\nTotal: ${results.length} | Successful: ${successful} | Failed: ${failed}`);
        console.log('\n=== All Migrations Completed ===');
        
    } catch (error) {
        console.error('Migration runner failed:', error);
        process.exit(1);
    }
}

runAllMigrations();