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

// Enhanced Supabase client with better configuration for rate limiting and reliability
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings to be more resilient
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
	  storage: window.localStorage, // Explicitly use localStorage
    // Add retry logic for auth requests
    retryAttempts: 2, // Reduced from 3 to avoid excessive retries
    // Increase timeout for auth requests to handle slow responses
    timeout: 15000, // 15 seconds timeout
    // Configure storage key to avoid conflicts
    storageKey: 'whatthemenu-auth',
    // Configure flow type for better compatibility
    flowType: 'pkce'
  },
  // Add global request options
  global: {
    headers: {
      'x-client-info': 'whatthemenu-web',
      'x-client-version': '1.0.0'
    },
    // Add fetch options for better error handling
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        // Add timeout to all requests
        signal: AbortSignal.timeout(30000), // 30 second timeout for all requests
      });
    }
  },
  // Configure realtime settings
  realtime: {
    // Reduce reconnection attempts to avoid spamming
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: 3000,
  },
  // Database configuration
  db: {
    // Configure schema if needed
    schema: 'public'
  }
});

// Helper function to handle auth requests with exponential backoff
export const authWithRetry = async (
  authFunction: () => Promise<any>,
  maxRetries: number = 2,
  baseDelay: number = 2000
): Promise<any> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await authFunction();
      
      // If there's an error in the result, throw it to trigger retry logic
      if (result.error) {
        throw result.error;
      }
      
      return result;
    } catch (error: any) {
      console.log(`Auth attempt ${attempt + 1} failed:`, error.message);
      
      // If it's a rate limit error and we have retries left
      if (error?.status === 429 && attempt < maxRetries - 1) {
        // Exponential backoff: 2s, 4s
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If it's a network error and we have retries left
      if ((error?.message?.includes('fetch') || error?.message?.includes('network')) && attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Network error, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If we've exhausted retries or it's not a retryable error, throw the original error
      throw error;
    }
  }
};

// Enhanced error handling utility
export const handleSupabaseError = (error: any): string => {
  if (!error) return 'An unknown error occurred';
  
  const message = error.message?.toLowerCase() || '';
  const status = error.status || error.code;

  // Rate limiting errors
  if (status === 429 || message.includes('rate') || message.includes('limit')) {
    return 'Too many requests. Please wait a few minutes before trying again.';
  }

  // Authentication errors
  if (message.includes('invalid') && message.includes('email')) {
    return 'Please enter a valid email address.';
  }

  if (message.includes('not found') || message.includes('no user')) {
    return 'No account found with this email address.';
  }

  if (message.includes('already registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  // Network/connectivity errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'Connection error. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out') || message.includes('aborted')) {
    return 'Request timed out. Please try again.';
  }

  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'Permission denied. Please try signing in again.';
  }

  // Server errors
  if (status >= 500) {
    return 'Server error. Please try again in a few minutes.';
  }

  // Return the original message if we can't categorize it
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Utility function to check if Supabase is properly configured
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    console.log('✅ Supabase connection verified');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

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

// Additional type interfaces for better type safety
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_type: string;
  scans_used: number;
  scans_limit: number;
  current_menu_dish_explanations: number;
  created_at: string;
  updated_at: string;
  subscription_expires_at?: string;
  subscription_status?: string;
}

export interface Order {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  location_data: any;
  total_dishes_scanned: number;
  first_scanned_at: string;
  last_scanned_at: string;
  created_at: string;
}

// Export configured client as default
export default supabase;