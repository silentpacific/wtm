import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These values are placeholders. You must replace them with your own
// Supabase project's URL and Anon Key. In a deployed Netlify environment,
// you should set these as environment variables.
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_PROJECT_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
  console.error("Supabase URL is not configured. Please check your environment variables.");
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error("Supabase Anon Key is not configured. Please check your environment variables.");
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
