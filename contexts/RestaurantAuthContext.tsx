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
  restaurant: RestaurantAccount | null; // Changed from restaurantAccount to restaurant
  loading: boolean;
  signUp: (data: RestaurantSignUpData) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Added logout alias
  resetPassword: (email: string) => Promise<any>;
  updateRestaurantProfile: (updates: Partial<RestaurantAccount>) => Promise<any>;
  refreshRestaurantAccount: () => Promise<void>;
}

const RestaurantAuthContext = createContext<RestaurantAuthContextType>({} as RestaurantAuthContextType);

export const useRestaurantAuth = () => useContext(RestaurantAuthContext);

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
  const [restaurant, setRestaurant] = useState<RestaurantAccount | null>(null); // Changed variable name
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
        setRestaurant(account);
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
          setRestaurant(account);
        } else {
          setRestaurant(null);
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

// Restaurant Sign Up - Using direct Supabase calls
const signUp = async (data: RestaurantSignUpData) => {
  try {
    console.log('Creating restaurant account with direct Supabase...');

    // Step 1: Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          user_type: 'restaurant',
          restaurant_name: data.restaurantName,
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    console.log('Auth user created:', authData.user.id);

    // Step 2: Generate unique slug
    const generateSlug = (restaurantName: string): string => {
      return restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .substring(0, 50);
    };

    let baseSlug = generateSlug(data.restaurantName);
    let slug = baseSlug;
    let counter = 1;
    
    // Check for unique slug
    while (true) {
      const { data: existingRestaurant } = await supabase
        .from('restaurant_accounts')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (!existingRestaurant) {
        break; // Slug is unique
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    console.log('Generated unique slug:', slug);

    // Step 3: Create restaurant account record
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const restaurantData = {
      id: authData.user.id,
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
      trial_ends_at: trialEndDate.toISOString(),
      page_views: 0,
      total_dish_clicks: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurant_accounts')
      .insert(restaurantData)
      .select()
      .single();

    if (restaurantError) {
      console.error('Restaurant creation error:', restaurantError);
      throw new Error('Failed to create restaurant account: ' + restaurantError.message);
    }

    console.log('Restaurant account created successfully!');

    // Step 4: Send welcome email (optional - won't block signup)
    try {
      await sendRestaurantWelcomeEmail(
        restaurant.id,
        restaurant.email,
        restaurant.restaurant_name,
        restaurant.contact_person
      );
    } catch (emailError) {
      console.warn('Welcome email failed, but signup completed');
    }

    console.log('✅ Restaurant account created and signed in successfully');
    return { data: authData, error: null };

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
    if (!user || !restaurant) {
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

      setRestaurant(data);
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
    setRestaurant(account);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRestaurant(null);
  };

  // Logout alias for signOut
  const logout = signOut;

  return (
    <RestaurantAuthContext.Provider value={{
      user,
      session,
      restaurant, // Changed from restaurantAccount to restaurant
      loading,
      signUp,
      signIn,
      signOut,
      logout, // Added logout alias
      resetPassword,
      updateRestaurantProfile,
      refreshRestaurantAccount
    }}>
      {children}
    </RestaurantAuthContext.Provider>
  );
};