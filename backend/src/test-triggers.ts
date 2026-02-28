import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing SUPABASE_URL or keys');
    process.exit(1);
}

const supabase = createClient(url, key);

async function listTriggers() {
    console.log('Querying triggers...');
    // ---added by akmal--We try to use the 'rpc' method if the user has a custom function, 
    // ---added by akmal--but since we don't know, we'll try to query information_schema.triggers via a raw query if possible.
    // ---added by akmal--However, the supabase-js client doesn't support raw SQL unless via RPC.

    // ---added by akmal--Instead, let's try to just see if we can insert into 'users' manually to see if it triggers the error.
    console.log('Attempting a manual insert into users table to test constraints/triggers...');
    const dummyId = '00000000-0000-0000-0000-000000000001';
    const { error } = await supabase.from('users').insert({
        id: dummyId,
        email: 'test-trigger@example.com',
        name: 'Trigger Test'
    });

    if (error) {
        console.log('Manual insert failed:', error.message);
        console.log('Error Code:', error.code);
    } else {
        console.log('Manual insert succeeded (no triggers failed on insert).');
        // ---added by akmal--Clean up
        await supabase.from('users').delete().eq('id', dummyId);
    }
}

listTriggers();
