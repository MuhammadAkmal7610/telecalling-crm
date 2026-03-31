import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env relative to current script
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkIntegrations() {
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('type', 'email');

  if (error) {
    console.error('Error fetching integrations:', error.message);
    return;
  }

  console.log('Email Integrations found:', JSON.stringify(data, null, 2));
}

checkIntegrations();
