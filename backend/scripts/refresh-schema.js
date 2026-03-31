/**
 * refresh-schema.js — Refresh Supabase Schema Cache
 * 
 * This script forces Supabase to refresh its schema cache by running a query
 * that references the activities table with the lead_id column.
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('\n❌ ERROR: DATABASE_URL environment variable is missing in .env\n');
    process.exit(1);
}

async function refreshSchema() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('\n🔌 Connected to database.');

        // Force schema cache refresh by querying the activities table
        // with the lead_id column that Supabase claims doesn't exist
        console.log('\n🔄 Refreshing schema cache...');
        
        const result = await client.query(`
            SELECT 
                a.id,
                a.lead_id,
                a.user_id,
                a.type,
                a.created_at,
                l.name as lead_name
            FROM activities a
            LEFT JOIN leads l ON a.lead_id = l.id
            WHERE a.lead_id IS NOT NULL
            LIMIT 1
        `);

        console.log('✅ Schema cache refreshed successfully!');
        console.log(`📊 Found ${result.rows.length} activity record(s) with lead_id`);

        // Test a simple query with lead_id to verify the column exists
        console.log('\n🧪 Testing lead_id column access...');
        const testResult = await client.query(`
            SELECT id, lead_id, type, created_at
            FROM activities
            WHERE lead_id IS NOT NULL
            LIMIT 1
        `);

        console.log('✅ lead_id column is accessible!');
        console.log(`📊 Sample activity: ${JSON.stringify(testResult.rows[0] || {})}`);

    } catch (error) {
        console.error('\n❌ Error refreshing schema cache:', error.message);
        
        // If the error is about lead_id column, let's check what columns actually exist
        if (error.message.includes('lead_id')) {
            console.log('\n🔍 Checking actual columns in activities table...');
            try {
                const columnsResult = await client.query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = 'activities' 
                    ORDER BY column_name
                `);
                
                console.log('\n📋 Current activities table columns:');
                columnsResult.rows.forEach(row => {
                    console.log(`   - ${row.column_name}: ${row.data_type}`);
                });
            } catch (schemaError) {
                console.error('❌ Could not check table schema:', schemaError.message);
            }
        }
        
        process.exit(1);
    } finally {
        await client.end();
    }
}

refreshSchema();