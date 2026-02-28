import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key
// You can find these in your Supabase Dashboard -> Project Settings -> API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing!');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey ? 'Found' : 'Missing');
} else {
    console.log('Supabase Client Initialized with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
