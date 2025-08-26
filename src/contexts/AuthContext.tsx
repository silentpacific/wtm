// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import AuthService from '../services/authService';
import type { Restaurant, SignupData, LoginData } from '../services/supabaseClient';

// Auth context types
interface AuthContextType {
  // State
  user: User | null;
  restaurant: Restaurant | null;
  session: Session | null;
  authLoading: boolean;
  
  // Actions
  signUp: (signupData: SignupData) => Promise<void>;
  signIn: (loginData: LoginData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Restaurant>) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    // Set a failsafe timeout to ensure authLoading gets set to false
    const failsafeTimeout = setTimeout(() => {
      setAuthLoading(false);
    }, 5000);

    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        try {
          if (session) {
            setUser(session.user);
            setSession(session);
            
            // Get restaurant profile with timeout - but don't block auth completion
            try {
              const restaurantPromise = AuthService.getRestaurantProfile(session.user.id);
              const timeoutPromise = new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              );
              
              const restaurantProfile = await Promise.race([restaurantPromise, timeoutPromise]);
              setRestaurant(restaurantProfile);
            } catch (restaurantError) {
              // Continue anyway - restaurant profile is not critical for auth
              setRestaurant(null);
            }
          } else {
            setUser(null);
            setSession(null);
            setRestaurant(null);
          }
          
          clearTimeout(failsafeTimeout);
          setAuthLoading(false);
        } catch (error) {
          clearTimeout(failsafeTimeout);
          setAuthLoading(false);
        }
      }
    );

    return () => {
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const authData = await AuthService.getCurrentSession();
      if (authData) {
        setUser(authData.user);
        setSession(authData.session);
        setRestaurant(authData.restaurant);
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
    }
  };

  const signUp = async (signupData: SignupData) => {
    try {
      setAuthLoading(true);
      const result = await AuthService.signUpRestaurant(signupData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (loginData: LoginData) => {
    try {
      setAuthLoading(true);
      const result = await AuthService.signInRestaurant(loginData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);
      await AuthService.signOut();
      
      setUser(null);
      setSession(null);
      setRestaurant(null);
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Restaurant>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const updatedRestaurant = await AuthService.updateRestaurantProfile(user.id, updates);
      setRestaurant(updatedRestaurant);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
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
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;