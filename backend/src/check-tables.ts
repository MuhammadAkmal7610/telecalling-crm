import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or keys');
    process.exit(1);
}

const supabase = createClient(url, key);

async function listTables() {
    console.log('Detecting if common tables exist...');
    const tables = ['organizations', 'users', 'leads', 'tasks', 'activities', 'campaigns'];

    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(0);
        if (error) {
            console.log(`Table ${table}: FAIL (${error.message})`);
        } else {
            console.log(`Table ${table}: OK`);
        }
    }
}

listTables();
