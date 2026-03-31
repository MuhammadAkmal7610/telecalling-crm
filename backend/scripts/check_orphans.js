
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findOrphans() {
    console.log('Finding users with no workspace memberships...');
    const { data: users } = await supabase.from('users').select('id, email, organization_id');
    const { data: members } = await supabase.from('workspace_members').select('user_id');
    
    const memberIds = new Set(members.map(m => m.user_id));
    const orphans = users.filter(u => !memberIds.has(u.id));
    
    console.log('Orphaned Users:', orphans);

    console.log('\nChecking default workspaces for organizations:');
    const { data: orgs } = await supabase.from('organizations').select('id, name');
    for (const org of orgs) {
        const { data: defaultWs } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', org.id)
            .eq('is_default', true)
            .maybeSingle();
        console.log(`Org: ${org.name} (${org.id}) - Default WS: ${defaultWs ? 'Found' : 'MISSING'}`);
    }
}

findOrphans();
