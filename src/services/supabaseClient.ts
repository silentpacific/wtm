// src/services/supabaseClient.ts - Supabase Database Connection
import { createClient } from '@supabase/supabase-js';

// Environment variables - add these to your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
   throw new Error(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Define them in Netlify environment variables (or a local .env for dev).'
  );
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types
export interface Restaurant {
  id: number;
  auth_user_id: string;
  name: string;
  owner_name: string;
  cuisine_type: string;
  phone: string;
  address: string;
  city: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}

// Auth helper types
export interface SignupData {
  email: string;
  password: string;
  restaurantName: string;
  ownerName: string;
  cuisineType: string;
  phone: string;
  address: string;
  city: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export default supabase;