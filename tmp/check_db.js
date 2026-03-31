
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'c:/Users/SC/Desktop/telecalling.crm/backend/.env' });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function check() {
    console.log('--- USERS ---');
    const { data: users, error: uError } = await supabase.from('users').select('*').limit(5);
    if (uError) console.error(uError);
    else console.log(users);

    console.log('--- WORKSPACES ---');
    const { data: workspaces, error: wError } = await supabase.from('workspaces').select('*').limit(5);
    if (wError) console.error(wError);
    else console.log(workspaces);

    console.log('--- MEMBERSHIPS ---');
    const { data: memberships, error: mError } = await supabase.from('workspace_members').select('*').limit(10);
    if (mError) console.error(mError);
    else console.log(memberships);
}

check();
