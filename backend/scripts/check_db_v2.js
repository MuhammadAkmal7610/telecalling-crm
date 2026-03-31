
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function check() {
    try {
        console.log('--- ALL WORKSPACES ---');
        const { data: workspaces, error: wError } = await supabase.from('workspaces').select('*');
        if (wError) console.error('WS Error:', wError);
        else console.log('Workspaces:', workspaces);

        console.log('\n--- ALL USERS ---');
        const { data: users, error: uError } = await supabase.from('users').select('id, email, organization_id');
        if (uError) console.error('User Error:', uError);
        else console.log('Users:', users);

        console.log('\n--- ALL MEMBERSHIPS ---');
        const { data: memberships, error: mError } = await supabase.from('workspace_members').select('*');
        if (mError) console.error('Membership Error:', mError);
        else console.log('Memberships:', memberships);
        
    } catch (e) {
        console.error('Script Failed:', e);
    }
}

check();
