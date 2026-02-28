const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

async function run() {
    console.log("Connecting to database...");
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log("Connected. Adding column...");
        await client.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'Task';");
        console.log("Column added successfully.");
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await client.end();
        console.log("Disconnected.");
    }
}

run();
