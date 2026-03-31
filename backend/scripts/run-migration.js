const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const migrationFile = process.argv[2] || '20260330_add_fields_to_leads.sql';
const sqlPath = path.join(__dirname, '../database/migrations', migrationFile);

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully.');

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL migration...');
    
    // Split by semicolon if needed, but pg.Client.query can handle multiple statements if separated by semicolons
    await client.query(sql);
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
