
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const AKMAL_ORG_ID = 'e9da733f-bd43-40fa-ab3b-c0fa3686da1f';

const defaultStages = [
    { name: 'New', type: 'fresh', color: '#3B82F6', position: 0, is_default: true },
    { name: 'Contacted', type: 'active', color: '#F59E0B', position: 1, is_default: false },
    { name: 'Qualified', type: 'active', color: '#10B981', position: 2, is_default: false },
    { name: 'Proposal Sent', type: 'active', color: '#8B5CF6', position: 3, is_default: false },
    { name: 'Won', type: 'won', color: '#059669', position: 4, is_default: false },
    { name: 'Lost', type: 'lost', color: '#EF4444', position: 5, is_default: false },
];

async function fixPipeline() {
    console.log('--- Pipeline Fix Script Started ---');

    // 1. Get all workspaces in akmal.org
    const { data: workspaces, error: wsError } = await supabase
        .from('workspaces')
        .select('id, name')
        .eq('organization_id', AKMAL_ORG_ID);
    
    if (wsError) {
        console.error('Error fetching workspaces:', wsError);
        return;
    }

    for (const ws of workspaces) {
        console.log(`Checking stages for workspace: ${ws.name} (${ws.id})...`);
        const { data: stages } = await supabase
            .from('lead_stages')
            .select('id, name')
            .eq('workspace_id', ws.id);
        
        let newStageId;
        if (stages.length === 0) {
            console.log(`Initializing default stages for workspace: ${ws.name}`);
            const inserts = defaultStages.map(s => ({
                ...s,
                organization_id: AKMAL_ORG_ID,
                workspace_id: ws.id
            }));
            const { data: createdStages, error: insError } = await supabase
                .from('lead_stages')
                .insert(inserts)
                .select();
            
            if (insError) {
                console.error('Error creating stages:', insError);
                continue;
            }
            newStageId = createdStages.find(s => s.name === 'New').id;
            console.log('Successfully created default stages.');
        } else {
            newStageId = stages.find(s => s.name === 'New')?.id;
            console.log('Stages already exist.');
        }

        // 2. Update leads with NULL stage_id
        if (newStageId) {
            console.log(`Updating orphaned leads in workspace: ${ws.name} to 'New' stage...`);
            const { data: updated, error: updError, count } = await supabase
                .from('leads')
                .update({ stage_id: newStageId })
                .eq('workspace_id', ws.id)
                .is('stage_id', null)
                .select('id');
            
            if (updError) console.error('Error updating leads:', updError);
            else console.log(`Successfully updated ${updated.length} leads.`);
        }
    }

    console.log('--- Pipeline Fix Script Completed ---');
}

fixPipeline();
