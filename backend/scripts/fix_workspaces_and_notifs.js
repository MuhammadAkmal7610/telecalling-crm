
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const AKMAL_ORG_ID = 'e9da733f-bd43-40fa-ab3b-c0fa3686da1f';

async function runFix() {
    console.log('--- Database Fix Script Started ---');

    // 1. Create Default Workspace for akmal.org if missing
    console.log('Checking for default workspace in akmal.org...');
    const { data: existingDefault } = await supabase
        .from('workspaces')
        .select('id')
        .eq('organization_id', AKMAL_ORG_ID)
        .eq('is_default', true)
        .maybeSingle();

    let defaultWsId;
    if (!existingDefault) {
        console.log('Default workspace missing. Creating one...');
        const { data: newWs, error: wsError } = await supabase
            .from('workspaces')
            .insert({
                name: 'akmal.org - Default',
                organization_id: AKMAL_ORG_ID,
                is_default: true,
                slug: `default-${AKMAL_ORG_ID.substring(0, 8)}`,
                settings: {}
            })
            .select()
            .single();
        
        if (wsError) {
            console.error('Error creating default workspace:', wsError);
            return;
        }
        console.log('Successfully created default workspace:', newWs.id);
        defaultWsId = newWs.id;
    } else {
        console.log('Default workspace already exists:', existingDefault.id);
        defaultWsId = existingDefault.id;
    }

    // 2. Find orphaned users in akmal.org and link them
    console.log('Finding orphaned users in akmal.org...');
    const { data: users } = await supabase
        .from('users')
        .select('id, email')
        .eq('organization_id', AKMAL_ORG_ID);
    
    const { data: currentMembers } = await supabase
        .from('workspace_members')
        .select('user_id')
        .eq('workspace_id', defaultWsId);
    
    const memberIds = new Set(currentMembers.map(m => m.user_id));
    const orphans = users.filter(u => !memberIds.has(u.id));

    if (orphans.length > 0) {
        console.log(`Found ${orphans.length} orphaned users. Linking to default workspace...`);
        const inserts = orphans.map(u => ({
            workspace_id: defaultWsId,
            user_id: u.id,
            role: 'admin' // defaulting to admin to give them access, can be adjusted later
        }));

        const { error: insError } = await supabase.from('workspace_members').insert(inserts);
        if (insError) console.error('Error linking users:', insError);
        else console.log('Successfully linked all orphaned users.');
    } else {
        console.log('No orphaned users found in akmal.org.');
    }

    // 3. Create a "System Fix" notification for affected users
    console.log('Sending welcome notifications...');
    const allAkmalUsers = users.map(u => u.id);
    const notifications = allAkmalUsers.map(uid => ({
        user_id: uid,
        organization_id: AKMAL_ORG_ID,
        title: 'Workspace Access Restored',
        message: 'Your workspace access has been restored. You now have access to the default workspace.',
        type: 'info',
        read: false
    }));

    const { error: nError } = await supabase.from('notifications').insert(notifications);
    if (nError) console.error('Error creating notifications:', nError);
    else console.log('Successfully created restore notifications.');

    console.log('--- Database Fix Script Completed ---');
}

runFix();
