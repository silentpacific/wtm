// src/contexts/AuthContext.tsx - Final minimal working version
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
    try {
      const { data, error } = await supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

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
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          return;
        }

        if (mounted && session?.user) {
          setUser(session.user);
          setSession(session);
          
          const profile = await getRestaurantProfile(session.user.id);
          if (mounted) {
            setRestaurant(profile);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

	const { data: { subscription } } = supabase.auth.onAuthStateChange(
	  async (event, session) => {
		if (!mounted) return;

		if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
		  setUser(session?.user || null);
		  setSession(session);

		  if (session?.user) {
			const profile = await getRestaurantProfile(session.user.id);
			setRestaurant(profile);
		  }
		} else if (event === 'SIGNED_OUT') {
		  setUser(null);
		  setRestaurant(null);
		  setSession(null);
		}

		setAuthLoading(false); // ✅ always clear loading
	  }
	);

	  // ✅ Fallback: ensure authLoading eventually clears
	  const timeout = setTimeout(() => {
		if (authLoading) {
		  console.warn("Auth still loading after 5s, forcing false.");
		  setAuthLoading(false);
		}
	  }, 5000);
	  
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
    
    setUser(null);
    setRestaurant(null);
    setSession(null);
  };

	const signUp = async (data: SignUpData): Promise<void> => {
	  const { data: authData, error: authError } = await supabase.auth.signUp({
		email: data.email,
		password: data.password,
	  });

	  if (authError) {
		throw new Error(authError.message);
	  }

	  if (!authData.user) {
		throw new Error('Failed to create user account');
	  }

	  // Fetch the user ID from session after signup (safer)
	  let userId = authData.user?.id;
	  if (!userId) {
		const { data: { user }, error } = await supabase.auth.getUser();
		if (error || !user) {
		  throw new Error("Could not retrieve user after signup");
		}
		userId = user.id;
	  }

	  // ✅ Use userId here instead of authData.user.id
	  if (userId) {
		const profile = {
		  id: userId,                // required PK
		  auth_user_id: userId,      // foreign key
		  email: data.email,
		  full_name: data.ownerName || null,
		  restaurant_name: data.restaurantName || null,
		  owner_name: data.ownerName || null,
		  cuisine_type: data.cuisineType || null,
		  phone: data.phone || null,
		  address: data.address || null,
		  city: data.city || null,
		  // state and country can be added here if your form collects them
		};

		const cleanProfile = Object.fromEntries(
		  Object.entries(profile).filter(([_, v]) => v !== undefined)
		);

		const { error: profileError } = await supabase
		  .from("user_restaurant_profiles")
		  .upsert([cleanProfile], { onConflict: "id,auth_user_id" });

		if (profileError) {
		  console.error("Profile creation/upsert error:", profileError);
		}
	  }
	};


	const refreshAuth = async (): Promise<void> => {
	  if (!user) return;
	  
	  try {
		const profile = await getRestaurantProfile(user.id);
		setRestaurant(profile);
	  } catch (error) {
		console.error("Refresh error:", error);
	  }
	};

	return (
	  <AuthContext.Provider value={{
		user,
		restaurant,
		session,
		authLoading,
		signUp,
		signIn,
		signOut,
		refreshAuth
	  }}>
		{children}
	  </AuthContext.Provider>
	);
	};