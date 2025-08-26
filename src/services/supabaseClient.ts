import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Types re-exported for the rest of the app ----
export type SignupData = {
  email: string;
  password: string;
  restaurantName?: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine?: string;
  owner_id?: string;
};
