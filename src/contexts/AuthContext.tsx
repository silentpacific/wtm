// src/contexts/AuthContext.tsx
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
  menu_uploaded?: boolean;
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
  menu_uploaded: boolean;
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
    const { data, error } = await supabase
      .from('user_restaurant_profiles')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (error) {
      console.error('Restaurant profile error:', error);
      return null;
    }
    return data || null;
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          if (mounted) setAuthLoading(false);
          return;
        }

        if (mounted) {
          setSession(session ?? null);
          setUser(session?.user ?? null);

          if (session?.user) {
            const profile = await getRestaurantProfile(session.user.id);
            if (mounted) setRestaurant(profile);
          } else {
            setRestaurant(null);
          }

          setAuthLoading(false);
        }
      } catch (err) {
        console.error("initAuth error:", err);
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          setSession(session || null);
          if (session?.user) {
            const profile = await getRestaurantProfile(session.user.id);
            setRestaurant(profile);
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
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
    setRestaurant(null);
    setSession(null);
  };

  const signUp = async (data: SignUpData): Promise<void> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) throw new Error(authError.message);
    if (!authData.user) throw new Error("Failed to create user account");
  };

  const refreshAuth = async (): Promise<void> => {
    if (!user) return;
    const profile = await getRestaurantProfile(user.id);
    setRestaurant(profile);
  };

  const menu_uploaded = !!restaurant?.menu_uploaded;

  return (
    <AuthContext.Provider value={{
      user,
      restaurant,
      session,
      authLoading,
      signUp,
      signIn,
      signOut,
      refreshAuth,
      menu_uploaded
    }}>
      {children}
    </AuthContext.Provider>
  );
};
