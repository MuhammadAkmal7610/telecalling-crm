
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../backend/.env' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

console.log(`Connecting to: ${url}`);
const supabase = createClient(url, key);

async function test() {
    console.log('Testing connection...');
    const { data, error } = await supabase.from('organizations').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Count:', data);
    }
}

test();
