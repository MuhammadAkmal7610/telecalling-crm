
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, key);

async function testQuery() {
    const userId = '3572fd9b-0af8-4b9e-b107-3c72da2c65d4'; // muhammadakmal@gmail.com
    const organizationId = 'e9da733f-bd43-40fa-ab3b-c0fa3686da1f';

    console.log('Testing query with organization_id filter...');
    const { data, error } = await supabase
        .from('workspace_members')
        .select('role, workspace:workspaces(id, name, description, is_default, organization_id, created_at)')
        .eq('user_id', userId)
        .eq('workspaces.organization_id', organizationId);

    if (error) console.error('Query Error:', error);
    else console.log('Query result:', JSON.stringify(data, null, 2));

    console.log('\nTesting query WITHOUT organization_id filter...');
    const { data: data2, error: error2 } = await supabase
        .from('workspace_members')
        .select('role, workspace:workspaces(id, name, description, is_default, organization_id, created_at)')
        .eq('user_id', userId);

    if (error2) console.error('Query2 Error:', error2);
    else console.log('Query2 result:', JSON.stringify(data2, null, 2));
}

testQuery();
