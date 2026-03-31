
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkNotifications() {
    console.log('--- ALL NOTIFICATIONS ---');
    const { data: notifications, error } = await supabase.from('notifications').select('*').limit(20);
    if (error) console.error('Error:', error);
    else console.log('Notifications:', notifications);

    console.log('\n--- NOTIFICATIONS FOR akmal.org ---');
    const orgId = 'e9da733f-bd43-40fa-ab3b-c0fa3686da1f';
    const { data: orgNotifications, error: orgError } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', orgId);
    if (orgError) console.error('Org Error:', orgError);
    else console.log(`Found ${orgNotifications.length} notifications for akmal.org`);
    if (orgNotifications.length > 0) console.log(orgNotifications[0]);
}

checkNotifications();
