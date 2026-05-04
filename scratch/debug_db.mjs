
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log('--- Organizations ---');
    const { data: orgs } = await supabase.from('organizations').select('id, name');
    console.table(orgs);

    console.log('\n--- Workspaces ---');
    const { data: ws } = await supabase.from('workspaces').select('id, name, organization_id, is_default');
    console.table(ws);

    console.log('\n--- Users ---');
    const { data: users } = await supabase.from('users').select('id, email, organization_id');
    console.table(users);

    console.log('\n--- Workspace Members ---');
    const { data: members } = await supabase.from('workspace_members').select('*');
    console.table(members);
}

debug();
