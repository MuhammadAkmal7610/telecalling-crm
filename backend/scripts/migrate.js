/**
 * migrate.js — Universal Database Migration Runner
 *
 * USAGE:
 *   node scripts/migrate.js                  → run all pending migrations
 *   node scripts/migrate.js --list           → list all migrations + status
 *   node scripts/migrate.js --reset          → drop & re-run all migrations (DANGER)
 *   node scripts/migrate.js --file 003       → run a specific migration file
 *
 * HOW TO ADD A NEW MIGRATION:
 *   1. Create a new file in backend/migrations/
 *   2. Name it: NNN_description.sql  (e.g. 005_add_audit_log.sql)
 *   3. Run: node scripts/migrate.js
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const args = process.argv.slice(2);

if (!connectionString) {
    console.error('\n❌ ERROR: DATABASE_URL environment variable is missing in .env\n');
    process.exit(1);
}

async function getClient() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    await client.connect();
    return client;
}

async function ensureLogTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS migrations_log (
            id SERIAL PRIMARY KEY,
            filename TEXT NOT NULL UNIQUE,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    `);
}

function getMigrationFiles(filter) {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        console.error(`\n❌ ERROR: migrations/ folder not found at: ${MIGRATIONS_DIR}\n`);
        process.exit(1);
    }
    let files = fs.readdirSync(MIGRATIONS_DIR)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Alphabetical = numerical order (001, 002, 003...)

    if (filter) {
        files = files.filter(f => f.includes(filter));
    }
    return files;
}

async function runMigrations(client, files, force = false) {
    const { rows: applied } = await client.query('SELECT filename FROM migrations_log');
    const appliedSet = new Set(applied.map(r => r.filename));

    let ran = 0;
    for (const file of files) {
        if (!force && appliedSet.has(file)) {
            console.log(`  ⏭  Skipping  ${file}  (already applied)`);
            continue;
        }

        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
        console.log(`\n  ▶  Running   ${file} ...`);

        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query(
                'INSERT INTO migrations_log (filename) VALUES ($1) ON CONFLICT (filename) DO UPDATE SET applied_at = NOW()',
                [file]
            );
            await client.query('COMMIT');
            console.log(`  ✅ Done      ${file}`);
            ran++;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`\n  ❌ FAILED    ${file}`);
            console.error(`     Error: ${err.message}\n`);
            throw err; // Stop on failure
        }
    }

    return ran;
}

async function listMigrations(client) {
    const { rows: applied } = await client.query(
        'SELECT filename, applied_at FROM migrations_log ORDER BY applied_at'
    );
    const appliedMap = new Map(applied.map(r => [r.filename, r.applied_at]));
    const files = getMigrationFiles();

    console.log('\n  Migration Status:\n');
    console.log('  Status   | Filename                          | Applied At');
    console.log('  ---------|-----------------------------------|----------------------------');
    for (const file of files) {
        if (appliedMap.has(file)) {
            const d = new Date(appliedMap.get(file)).toLocaleString();
            console.log(`  ✅ DONE   | ${file.padEnd(33)} | ${d}`);
        } else {
            console.log(`  ⏳ PENDING | ${file.padEnd(33)} | —`);
        }
    }
    console.log('');
}

async function main() {
    const client = await getClient();
    console.log('\n🔌 Connected to database.\n');

    try {
        await ensureLogTable(client);

        if (args.includes('--list')) {
            await listMigrations(client);
        } else if (args.includes('--reset')) {
            console.log('\n⚠️  RESET MODE: Re-running ALL migrations (clearing log)...\n');
            await client.query('TRUNCATE migrations_log');
            const files = getMigrationFiles();
            const ran = await runMigrations(client, files, true);
            console.log(`\n✅ Reset complete. ${ran} migration(s) re-applied.\n`);
        } else if (args.includes('--file')) {
            const filter = args[args.indexOf('--file') + 1];
            if (!filter) { console.error('Usage: --file <pattern>'); process.exit(1); }
            const files = getMigrationFiles(filter);
            if (!files.length) { console.error(`No migrations matching "${filter}"`); process.exit(1); }
            const ran = await runMigrations(client, files, true);
            console.log(`\n✅ Done. ${ran} migration(s) applied.\n`);
        } else {
            // Default: run all pending
            const files = getMigrationFiles();
            if (!files.length) {
                console.log('  ℹ️  No migration files found in migrations/\n');
            } else {
                const ran = await runMigrations(client, files);
                if (ran === 0) {
                    console.log('\n  ✅ Everything is up to date. No pending migrations.\n');
                } else {
                    console.log(`\n  ✅ Done. ${ran} migration(s) applied.\n`);
                }
            }
        }
    } finally {
        await client.end();
    }
}

main().catch(err => {
    console.error('\n💥 Migration runner crashed:', err.message);
    process.exit(1);
});
