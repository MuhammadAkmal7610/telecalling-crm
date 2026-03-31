const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    console.log('Running migration: create billing tables...');

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
        -- 1. Billing Subscriptions Table
        CREATE TABLE IF NOT EXISTS billing_subscriptions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
            plan TEXT NOT NULL DEFAULT 'free',
            status TEXT NOT NULL DEFAULT 'active',
            limits JSONB NOT NULL DEFAULT '{"leads": 100, "users": 2}',
            current_period_end TIMESTAMP WITH TIME ZONE,
            stripe_subscription_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 2. Transactions Table
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            amount DECIMAL(10, 2) NOT NULL,
            currency TEXT NOT NULL DEFAULT 'INR',
            status TEXT NOT NULL DEFAULT 'success',
            type TEXT NOT NULL DEFAULT 'subscription',
            description TEXT,
            stripe_payment_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- 3. Organization Billing Info Table
        CREATE TABLE IF NOT EXISTS organization_billing_info (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
            company_name TEXT,
            email TEXT,
            phone TEXT,
            address_line1 TEXT,
            address_line2 TEXT,
            city TEXT,
            state TEXT,
            country TEXT,
            pincode TEXT,
            tax_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE organization_billing_info ENABLE ROW LEVEL SECURITY;

        -- Create Indexes
        CREATE INDEX IF NOT EXISTS idx_sub_org ON billing_subscriptions(organization_id);
        CREATE INDEX IF NOT EXISTS idx_trans_org ON transactions(organization_id);
        CREATE INDEX IF NOT EXISTS idx_info_org ON organization_billing_info(organization_id);
        `
    });

    if (error) {
        console.error('Migration failed:', error);
    } else {
        console.log('Migration completed successfully');
    }
}

runMigration();
