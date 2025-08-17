import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

interface RestaurantAccount {
  id: number;
  email: string;
  business_name: string;
  slug: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  cuisine_type?: string;
  subscription_status: 'trial' | 'active' | 'cancelled';
  trial_expires_at: string;
  created_at: string;
}

interface RestaurantAuthContextType {
  restaurant: RestaurantAccount | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, businessName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateRestaurant: (updates: Partial<RestaurantAccount>) => Promise<{ success: boolean; error?: string }>;
}

const RestaurantAuthContext = createContext<RestaurantAuthContextType | undefined>(undefined);

export const useRestaurantAuth = () => {
  const context = useContext(RestaurantAuthContext);
  if (context === undefined) {
    throw new Error('useRestaurantAuth must be used within a RestaurantAuthProvider');
  }
  return context;
};

export const RestaurantAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurant, setRestaurant] = useState<RestaurantAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Generate slug from business name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Check if user is authenticated on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if this is a restaurant account
        const { data, error } = await supabase
          .from('restaurant_business_accounts')
          .select('*')
          .eq('contact_email', session.user.email)
          .single();

        if (data && !error) {
          setRestaurant(data);
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get restaurant account details
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .select('*')
        .eq('contact_email', email)
        .single();

      if (restaurantError || !restaurantData) {
        await supabase.auth.signOut();
        return { success: false, error: 'Restaurant account not found' };
      }

      setRestaurant(restaurantData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, businessName: string) => {
    try {
      setLoading(true);
      
      const slug = generateSlug(businessName);
      
      // Check if slug already exists
      const { data: existingSlug } = await supabase
        .from('restaurant_business_accounts')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (existingSlug) {
        return { success: false, error: 'Restaurant name already taken' };
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Create restaurant account
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .insert([
          {
            business_name: businessName,
            slug: slug,
            contact_email: email,
            subscription_status: 'trial',
            trial_started_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (restaurantError) {
        // Clean up auth user if restaurant creation failed
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create restaurant account' };
      }

      setRestaurant(restaurantData);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setRestaurant(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (updates: Partial<RestaurantAccount>) => {
    if (!restaurant) {
      return { success: false, error: 'No restaurant account found' };
    }

    try {
      const { data, error } = await supabase
        .from('restaurant_business_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      setRestaurant(data);
      return { success: true };
    } catch (error) {
      console.error('Update restaurant error:', error);
      return { success: false, error: 'Update failed' };
    }
  };

  const value = {
    restaurant,
    loading,
    login,
    signup,
    logout,
    updateRestaurant,
  };

  return (
    <RestaurantAuthContext.Provider value={value}>
      {children}
    </RestaurantAuthContext.Provider>
  );
};