// src/contexts/AuthContext.tsx - Minimal version for debugging
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface Restaurant {
  id: string;
  auth_user_id: string;
  restaurant_name: string | null;
  owner_name: string | null;
  cuisine_type: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  email: string | null;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const getRestaurantProfile = async (authUserId: string): Promise<Restaurant | null> => {
    console.log('Starting restaurant profile fetch for:', authUserId);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });

      const queryPromise = supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('Restaurant profile query result:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Restaurant profile fetch failed:', error);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('🚀 Starting auth initialization');
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          if (isMounted) setAuthLoading(false);
          return;
        }

        console.log('📝 Session check complete. User exists:', !!session?.user);

        if (!isMounted) return;

        if (session?.user) {
          console.log('👤 Setting user state');
          setUser(session.user);
          setSession(session);
          
          console.log('🏢 Fetching restaurant profile...');
          const restaurantProfile = await getRestaurantProfile(session.user.id);
          
          if (isMounted) {
            console.log('🏢 Restaurant profile result:', !!restaurantProfile);
            setRestaurant(restaurantProfile);
          }
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
      } finally {
        if (isMounted) {
          console.log('✅ Auth initialization complete - setting authLoading to FALSE');
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('🔄 Auth state change:', event, 'User ID:', session?.user?.id);

        // Set loading to true when processing auth changes
        setAuthLoading(true);

        try {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('📥 Processing sign in');
            setUser(session?.user || null);
            setSession(session);
            
            if (session?.user) {
              console.log('🏢 Fetching restaurant profile after sign in...');
              const restaurantProfile = await getRestaurantProfile(session.user.id);
              if (isMounted) {
                console.log('🏢 Restaurant profile after sign in:', !!restaurantProfile);
                setRestaurant(restaurantProfile);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('📤 Processing sign out');
            setUser(null);
            setRestaurant(null);
            setSession(null);
          }
        } catch (error) {
          console.error('💥 Auth state change error:', error);
        } finally {
          if (isMounted) {
            console.log('✅ Auth state change complete - setting authLoading to FALSE');
            setAuthLoading(false);
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth context');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('🔑 Starting sign in process');
    setAuthLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Sign in successful');
      // Auth state change handler will manage loading state
      
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      setAuthLoading(false);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('🚪 Starting sign out process');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Clear state immediately 
      setUser(null);
      setRestaurant(null);
      setSession(null);
      setAuthLoading(false);
      
      console.log('✅ Sign out complete');
      
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpData): Promise<void> => {
    console.log('📝 Starting signup process');
    setAuthLoading(true);
    
    try {
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

      console.log('✅ User created successfully');
      // Auth state change handler will manage the rest
      
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      setAuthLoading(false);
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

  console.log('🔍 AuthContext render - user:', !!user, 'authLoading:', authLoading, 'restaurant:', !!restaurant);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};