const { createClient } = require('@supabase/supabase-js');

// Replace with your Supabase credentials
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLeadWorkspaceAssignment() {
    console.log('Testing Lead Workspace Assignment...\n');
    
    // 1. Check current leads and their workspace assignments
    console.log('1. Current leads and their workspace assignments:');
    const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email, workspace_id, created_at')
        .limit(5);
    
    if (leadsError) {
        console.error('Error fetching leads:', leadsError);
        return;
    }
    
    leads.forEach(lead => {
        console.log(`- Lead: ${lead.name}`);
        console.log(`  Email: ${lead.email}`);
        console.log(`  Workspace ID: ${lead.workspace_id || 'NOT ASSIGNED'}`);
        console.log(`  Created: ${lead.created_at}`);
        console.log('');
    });
    
    // 2. Check workspaces
    console.log('2. Available workspaces:');
    const { data: workspaces, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name, organization_id')
        .limit(5);
    
    if (workspacesError) {
        console.error('Error fetching workspaces:', workspacesError);
        return;
    }
    
    workspaces.forEach(workspace => {
        console.log(`- Workspace: ${workspace.name}`);
        console.log(`  ID: ${workspace.id}`);
        console.log(`  Organization: ${workspace.organization_id}`);
        console.log('');
    });
    
    // 3. Show how to create a lead with specific workspace
    console.log('3. To create a lead with specific workspace:');
    console.log(`
// Through API:
POST /api/v1/leads
{
    "name": "Test Lead",
    "email": "test@example.com",
    "phone": "+1234567890",
    "status": "new",
    "source": "manual"
}
// The workspace_id will be automatically assigned from the authenticated user's workspace
`);
}

testLeadWorkspaceAssignment().catch(console.error);
