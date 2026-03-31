const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        // Read and execute the migration file
        const fs = require('fs');
        const path = require('path');
        
        const migrationFile = path.join(__dirname, '../migrations/007_telephony_reporting.sql');
        const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

        // Execute the migration
        await client.query(migrationSQL);
        console.log('✅ Migration 007_telephony_reporting.sql executed successfully');

        // Verify tables were created
        const tablesCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('calls', 'call_analytics')
        `);
        
        console.log('📊 Tables created:', tablesCheck.rows.map(r => r.table_name));

        // Check if columns were added to existing tables
        const columnsCheck = await client.query(`
            SELECT column_name, table_name 
            FROM information_schema.columns 
            WHERE table_name IN ('leads', 'tasks') 
            AND column_name IN ('stage_id', 'value', 'call_count', 'total_call_duration', 'type', 'due_date')
            ORDER BY table_name, column_name
        `);
        
        console.log('🔧 Columns added:', columnsCheck.rows.map(r => `${r.table_name}.${r.column_name}`));

        // Test call_analytics table structure
        const analyticsCheck = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'call_analytics' 
            ORDER BY ordinal_position
        `);
        
        console.log('📈 Call analytics table structure:');
        analyticsCheck.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

// Run the migration
runMigration().catch(console.error);
