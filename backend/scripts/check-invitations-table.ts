import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInvitationsTable() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.log('Table "invitations" does not exist.');
    } else {
      console.error('Error checking invitations table:', error.message);
    }
  } else {
    console.log('Table "invitations" exists.');
  }
}

checkInvitationsTable();
