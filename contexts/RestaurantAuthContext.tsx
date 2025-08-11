import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface RestaurantAccount {
  id: string;
  email: string;
  restaurant_name: string;
  slug: string;
  contact_person?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired';
  subscription_started_at?: string;
  subscription_expires_at?: string;
  trial_ends_at?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_menu_data?: any;
  menu_last_updated?: string;
  qr_code_url?: string;
  page_views: number;
  total_dish_clicks: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RestaurantSignUpData {
  email: string;
  password: string;
  restaurantName: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface RestaurantAuthContextType {
  user: User | null;
  session: Session | null;
  restaurantAccount: RestaurantAccount | null;
  loading: boolean;
  signUp: (data: RestaurantSignUpData) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updateRestaurantProfile: (updates: Partial<RestaurantAccount>) => Promise<any>;
  refreshRestaurantAccount: () => Promise<void>;
}

const RestaurantAuthContext = createContext<RestaurantAuthContextType>({} as RestaurantAuthContextType);

export const useRestaurantAuth = () => useContext(RestaurantAuthContext);

// Generate a unique slug from restaurant name
const generateSlug = (restaurantName: string): string => {
  return restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
};

// Check if slug is available
const isSlugAvailable = async (slug: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('restaurant_accounts')
    .select('slug')
    .eq('slug', slug)
    .single();
  
  return !data; // If no data found, slug is available
};

// Generate unique slug
const generateUniqueSlug = async (restaurantName: string): Promise<string> => {
  let baseSlug = generateSlug(restaurantName);
  let slug = baseSlug;
  let counter = 1;
  
  while (!(await isSlugAvailable(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// Function to send restaurant welcome email
const sendRestaurantWelcomeEmail = async (restaurantId: string, email: string, restaurantName: string, contactPerson?: string) => {
  try {
    const response = await fetch('/.netlify/functions/restaurant-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        restaurantId,
        email,
        restaurantName,
        contactPerson
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send restaurant welcome email:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Restaurant welcome email sent:', result.message);
    return true;
  } catch (error) {
    console.error('Error sending restaurant welcome email:', error);
    return false;
  }
};

export const RestaurantAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [restaurantAccount, setRestaurantAccount] = useState<RestaurantAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch restaurant account data
  const fetchRestaurantAccount = async (userId: string): Promise<RestaurantAccount | null> => {
    try {
      const { data, error } = await supabase
        .from('restaurant_accounts')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching restaurant account:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching restaurant account:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const account = await fetchRestaurantAccount(session.user.id);
        setRestaurantAccount(account);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Restaurant auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const account = await fetchRestaurantAccount(session.user.id);
          setRestaurantAccount(account);
        } else {
          setRestaurantAccount(null);
        }
        
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Restaurant user signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('Restaurant user signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Restaurant Sign Up
  const signUp = async (data: RestaurantSignUpData) => {
    try {
      // First, create the auth account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/restaurants/dashboard`,
          data: {
            source: 'restaurant_signup',
            restaurant_name: data.restaurantName,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!signUpData.user) {
        throw new Error('Failed to create user account');
      }

      // Generate unique slug
      const slug = await generateUniqueSlug(data.restaurantName);

      // Create restaurant account record
      const restaurantData = {
        id: signUpData.user.id,
        email: data.email.trim().toLowerCase(),
        restaurant_name: data.restaurantName,
        slug: slug,
        contact_person: data.contactPerson || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || 'Australia',
        subscription_status: 'trial' as const,
        trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        page_views: 0,
        total_dish_clicks: 0,
        is_active: true
      };

      const { data: restaurantAccount, error: restaurantError } = await supabase
        .from('restaurant_accounts')
        .insert(restaurantData)
        .select()
        .single();

      if (restaurantError) {
        console.error('Error creating restaurant account:', restaurantError);
        throw new Error('Failed to create restaurant account');
      }

      // Immediately sign them in (no email verification required for restaurants)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email.trim().toLowerCase(),
        password: data.password
      });

      if (signInError) {
        console.log('Auto sign-in failed:', signInError);
        return { data: signUpData, error: null };
      }

      // Send welcome email (don't await to avoid blocking)
      sendRestaurantWelcomeEmail(
        signUpData.user.id, 
        data.email, 
        data.restaurantName,
        data.contactPerson
      ).then(success => {
        if (success) {
          console.log('✅ Restaurant welcome email sent');
        } else {
          console.log('❌ Failed to send restaurant welcome email');
        }
      });

      return { data: signInData, error: null };
    } catch (error: any) {
      console.error('Restaurant signup error:', error);
      throw error;
    }
  };

  // Restaurant Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;
      return { data, error };
    } catch (error: any) {
      console.error('Restaurant signin error:', error);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/restaurants/reset-password`,
        }
      );

      if (error) throw error;
      return { data, error };
    } catch (error: any) {
      console.error('Restaurant password reset error:', error);
      throw error;
    }
  };

  // Update Restaurant Profile
  const updateRestaurantProfile = async (updates: Partial<RestaurantAccount>) => {
    if (!user || !restaurantAccount) {
      throw new Error('No authenticated restaurant user');
    }

    try {
      const { data, error } = await supabase
        .from('restaurant_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setRestaurantAccount(data);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating restaurant profile:', error);
      throw error;
    }
  };

  // Refresh Restaurant Account
  const refreshRestaurantAccount = async () => {
    if (!user) return;

    const account = await fetchRestaurantAccount(user.id);
    setRestaurantAccount(account);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRestaurantAccount(null);
  };

  return (
    <RestaurantAuthContext.Provider value={{
      user,
      session,
      restaurantAccount,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updateRestaurantProfile,
      refreshRestaurantAccount
    }}>
      {children}
    </RestaurantAuthContext.Provider>
  );
};