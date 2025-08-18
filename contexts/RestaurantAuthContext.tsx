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
  contact_email?: string;
  website?: string;
  opening_hours?: string;
  special_notes?: string;
  description_en?: string;
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

  // Send welcome email
  const sendWelcomeEmail = async (email: string, businessName: string, slug: string, trialExpiresAt: string) => {
    try {
      console.log('📧 Sending welcome email to:', email);
      
      const response = await fetch('/.netlify/functions/restaurant-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          businessName,
          slug,
          trialExpiresAt,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email service responded with ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Welcome email sent successfully:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't fail the signup if email fails
      return false;
    }
  };

  // Check if user is authenticated on load
  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await loadRestaurantAccount(session.user.email!);
      } else if (event === 'SIGNED_OUT') {
        setRestaurant(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadRestaurantAccount = async (email: string) => {
    try {
      console.log('🔍 Loading restaurant account for:', email);
      
      const { data, error } = await supabase
        .from('restaurant_business_accounts')
        .select('*')
        .eq('contact_email', email)
        .single();

      if (error) {
        console.error('❌ Error loading restaurant account:', error);
        return null;
      }

      if (data) {
        console.log('✅ Restaurant account loaded:', data);
        setRestaurant(data);
        return data;
      } else {
        console.log('❌ No restaurant account found for email:', email);
        return null;
      }
    } catch (error) {
      console.error('💥 Error in loadRestaurantAccount:', error);
      return null;
    }
  };

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking initial auth state...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ Found existing session for:', session.user.email);
        await loadRestaurantAccount(session.user.email!);
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('💥 Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('🔐 Attempting login for:', email);

      // First, check if restaurant account exists
      const restaurantAccount = await loadRestaurantAccount(email);
      if (!restaurantAccount) {
        console.error('❌ No restaurant account found for this email');
        return { success: false, error: 'No restaurant account found for this email address' };
      }

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Login successful!');
      // Restaurant account will be loaded by the auth state change listener
      return { success: true };
    } catch (error) {
      console.error('💥 Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, businessName: string) => {
    try {
      setLoading(true);
      
      console.log('🚀 Starting signup process for:', { email, businessName });
      
      const slug = generateSlug(businessName);
      console.log('📝 Generated slug:', slug);
      
      // Check if slug already exists
      const { data: existingSlug, error: slugCheckError } = await supabase
        .from('restaurant_business_accounts')
        .select('slug')
        .eq('slug', slug)
        .maybeSingle(); // Use maybeSingle instead of single to avoid error when no results

      if (slugCheckError) {
        console.error('❌ Error checking slug:', slugCheckError);
        return { success: false, error: 'Error checking restaurant name availability' };
      }

      if (existingSlug) {
        console.error('❌ Slug already exists:', slug);
        return { success: false, error: 'Restaurant name already taken' };
      }

      console.log('✅ Slug available, creating Supabase auth account...');

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined // Disable email confirmation for now
        }
      });

      if (authError) {
        console.error('❌ Supabase signup error:', authError);
        return { success: false, error: authError.message };
      }

      console.log('✅ Supabase auth account created, creating restaurant account...');

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
        console.error('❌ Restaurant account creation failed:', restaurantError);
        // Clean up auth user if restaurant creation failed
        await supabase.auth.signOut();
        return { success: false, error: `Failed to create restaurant account: ${restaurantError.message}` };
      }

      console.log('✅ Restaurant account created:', restaurantData);

      // Send welcome email (don't block on this)
      const emailSent = await sendWelcomeEmail(
        email, 
        businessName, 
        slug, 
        restaurantData.trial_expires_at
      );

      if (emailSent) {
        console.log('✅ Welcome email sent successfully');
      } else {
        console.log('⚠️ Welcome email failed to send (non-blocking)');
      }

      // Set restaurant data
      setRestaurant(restaurantData);
      return { success: true };
    } catch (error) {
      console.error('💥 Signup error:', error);
      return { success: false, error: 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out...');
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