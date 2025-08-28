// src/contexts/AuthContext.tsx - Fixed auth context
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface Restaurant {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string | null;
  restaurant_name: string | null;
  cuisine_type: string | null;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  url_slug: string | null;
  subscription_type: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  session: Session | null;
  authLoading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

interface SignUpData {
  email: string;
  password: string;
  restaurantName?: string;
  ownerName?: string;
  cuisineType?: string;
  phone?: string;
  address?: string;
  city?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getRestaurantProfile = async (authUserId: string): Promise<Restaurant | null> => {
    try {
      // FIX: Query by auth_user_id, not id
      const { data, error } = await supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('auth_user_id', authUserId) // Changed from 'id' to 'auth_user_id'
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching restaurant profile:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getRestaurantProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }

        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          setSession(session);
          
          // Use auth_user_id for restaurant profile lookup
          const restaurantProfile = await getRestaurantProfile(session.user.id);
          if (isMounted) {
            setRestaurant(restaurantProfile);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          setSession(session);
          
          if (session?.user) {
            const restaurantProfile = await getRestaurantProfile(session.user.id);
            if (isMounted) {
              setRestaurant(restaurantProfile);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRestaurant(null);
          setSession(null);
        }

        setAuthLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData): Promise<void> => {
    setAuthLoading(true);
    
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.ownerName
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      // Step 2: Create restaurant profile if signup data provided
      if (data.restaurantName) {
        // Wait for auth to be established
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: restaurantData, error: restaurantError } = await supabase
          .from('user_restaurant_profiles')
          .insert([
            {
              auth_user_id: authData.user.id,
              restaurant_name: data.restaurantName,
              owner_name: data.ownerName,
              cuisine_type: data.cuisineType,
              phone: data.phone,
              address: data.address,
              city: data.city,
              email: data.email
            }
          ])
          .select()
          .single();

        if (restaurantError) {
          console.error('Restaurant creation error:', restaurantError);
          // Don't throw here - user account exists, they can complete profile later
        }
      }
      
    } catch (error: any) {
      console.error('SignUp error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      // Auth state change will handle setting user/restaurant via useEffect
      
    } catch (error: any) {
      console.error('SignIn error:', error);
      setAuthLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Clear state immediately 
      setUser(null);
      setRestaurant(null);
      setSession(null);
      
    } catch (error: any) {
      console.error('SignOut error:', error);
      throw error;
    }
  };

  const refreshAuth = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const restaurantProfile = await getRestaurantProfile(user.id);
      setRestaurant(restaurantProfile);
    } catch (error) {
      console.error('Error refreshing auth:', error);
    }
  };

  const value: AuthContextType = {
    user,
    restaurant,
    session,
    authLoading,
    signUp,
    signIn,
    signOut,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};