import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkTriggers() {
    console.log('Checking for triggers (this may fail if permissions are restricted)...');
    const { data, error } = await supabase.from('organizations').select('*').limit(1);
    if (error) {
        console.log('Error querying organizations:', error.message);
    } else {
        console.log('Successfully queried organizations table.');
    }
}

checkTriggers();
