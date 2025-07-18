import { createClient } from '@supabase/supabase-js';

// Detect if we're in browser or server environment
const isBrowser = typeof window !== 'undefined';

const supabaseUrl = isBrowser 
  ? import.meta.env.VITE_SUPABASE_URL || ''
  : process.env.SUPABASE_URL || '';
  
const supabaseAnonKey = isBrowser 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  : process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database interface for type safety (matching your Supabase schema)
export interface DishRecord {
  id?: number;
  name: string;
  explanation: string;
  tags: string[] | null;
  allergens: string[] | null;
  cuisine: string | null;
  created_at?: string;
}