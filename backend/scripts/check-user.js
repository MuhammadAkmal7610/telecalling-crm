const { createClient } = require('@supabase/supabase-base');
require('dotenv').config({ path: '../.env' });

async function checkUser(email) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Check users table
    console.log(`Checking 'users' table for email: ${email}...`);
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        console.error('Error fetching user from DB:', userError.message);
    } else {
        console.log('User found in DB:', JSON.stringify(userData, null, 2));
    }

    // 2. Check Auth metadata
    console.log('\nListing auth users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error listing auth users:', authError.message);
    } else {
        const authUser = authUsers.users.find(u => u.email === email);
        if (authUser) {
            console.log('Auth user metadata:', JSON.stringify(authUser.user_metadata, null, 2));
        } else {
            console.log('User not found in Auth service.');
        }
    }
}

// Get email from command line or use a default if provided by agent later
const email = process.argv[2];
if (!email) {
    console.error('Please provide an email address: node check-user.js <email>');
    process.exit(1);
}

checkUser(email);
