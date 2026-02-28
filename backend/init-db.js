const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Usage: node init-db.js [sql_file]
const sqlFile = process.argv[2] || 'database_schema.sql';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: Please provide a database connection string in .env (DATABASE_URL).');
    process.exit(1);
}

async function initDb() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log(`Reading ${sqlFile}...`);
        const sqlPath = path.resolve(__dirname, sqlFile);
        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found: ${sqlPath}`);
        }
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL...');
        await client.query(sql);

        console.log('✅ SQL executed successfully!');
    } catch (err) {
        console.error('❌ Error executing SQL:', err.message);
    } finally {
        await client.end();
    }
}

initDb();
