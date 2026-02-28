const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('Missing DATABASE_URL environment variable');
    process.exit(1);
}

async function runMigration() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to database. Running migration v5...');

        // 1. Add campaign_id to leads
        await client.query(`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;`);
        console.log('Added campaign_id to leads');

        // 2. Add rating to leads
        await client.query(`ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;`);
        console.log('Added rating to leads');

        // 3. Create index
        await client.query(`CREATE INDEX IF NOT EXISTS idx_leads_campaign ON public.leads(campaign_id);`);
        console.log('Created index on campaign_id');

        // 4. lead_field_definitions
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.lead_field_definitions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                label TEXT NOT NULL,
                type TEXT DEFAULT 'text',
                is_default BOOLEAN DEFAULT FALSE,
                is_searchable BOOLEAN DEFAULT TRUE,
                show_in_import BOOLEAN DEFAULT TRUE,
                show_in_quick_add BOOLEAN DEFAULT TRUE,
                lock_after_create BOOLEAN DEFAULT FALSE,
                can_use_variable BOOLEAN DEFAULT FALSE,
                position INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(organization_id, name)
            );
        `);
        console.log('Created lead_field_definitions table');

        // 5. Create integrations table
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.integrations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'inactive',
                config JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Created integrations table');

        // 6. Create reports table
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.reports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                status TEXT DEFAULT 'COMPLETED',
                size TEXT,
                url TEXT,
                created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('Created reports table');

        console.log('All migrations completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

runMigration().catch(err => {
    console.error('Migration execution error:', err);
});
