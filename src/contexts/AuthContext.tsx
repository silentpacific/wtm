// src/contexts/AuthContext.tsx - Fixed with Timeout
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

  console.log(`[AuthContext] Render - authLoading: ${authLoading}, user: ${user ? 'exists' : 'null'}`);

  // Helper function to safely set authLoading to false
  const completeAuthLoading = () => {
    console.log('[AuthContext] Setting authLoading to false');
    setAuthLoading(false);
  };

  // Initialize auth state on mount
  useEffect(() => {
    console.log('[AuthContext] useEffect - Starting initialization');
    
    // Set a failsafe timeout to ensure authLoading gets set to false
    const failsafeTimeout = setTimeout(() => {
      console.log('[AuthContext] Failsafe timeout - forcing authLoading to false');
      setAuthLoading(false);
    }, 5000); // 5 second timeout

    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext] Auth state change:', event, session ? 'session exists' : 'no session');
        
        try {
          if (session) {
            console.log('[AuthContext] Setting user and session from auth change');
            setUser(session.user);
            setSession(session);
            
            // Get restaurant profile with timeout
            console.log('[AuthContext] Fetching restaurant profile...');
            
            try {
              // Add timeout to restaurant profile fetch
              const restaurantPromise = AuthService.getRestaurantProfile(session.user.id);
              const timeoutPromise = new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Restaurant profile fetch timeout')), 3000)
              );
              
              const restaurantProfile = await Promise.race([restaurantPromise, timeoutPromise]);
              console.log('[AuthContext] Restaurant profile result:', restaurantProfile ? 'found' : 'not found');
              setRestaurant(restaurantProfile);
              
            } catch (restaurantError) {
              console.warn('[AuthContext] Restaurant profile fetch failed:', restaurantError);
              // Continue anyway - user can still use the app without restaurant profile
              setRestaurant(null);
            }
          } else {
            console.log('[AuthContext] Clearing auth state - no session');
            setUser(null);
            setSession(null);
            setRestaurant(null);
          }
          
          clearTimeout(failsafeTimeout);
          completeAuthLoading();
          
        } catch (error) {
          console.error('[AuthContext] Error in auth state change handler:', error);
          clearTimeout(failsafeTimeout);
          completeAuthLoading();
        }
      }
    );

    return () => {
      console.log('[AuthContext] Cleaning up subscription and timeout');
      clearTimeout(failsafeTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    console.log('[AuthContext] initializeAuth - Starting');
    
    try {
      const authData = await AuthService.getCurrentSession();
      console.log('[AuthContext] getCurrentSession result:', authData ? 'data found' : 'no data');
      
      if (authData) {
        console.log('[AuthContext] Setting initial auth data');
        setUser(authData.user);
        setSession(authData.session);
        setRestaurant(authData.restaurant);
      }
    } catch (error) {
      console.error('[AuthContext] Initialize auth error:', error);
    } finally {
      // Don't call completeAuthLoading here - let the auth state change handler do it
      // This prevents race conditions
      console.log('[AuthContext] initializeAuth completed');
    }
  };

  // Sign up function
  const signUp = async (signupData: SignupData) => {
    console.log('[AuthContext] signUp - Starting');
    try {
      setAuthLoading(true);
      const result = await AuthService.signUpRestaurant(signupData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
      
    } catch (error) {
      console.error('[AuthContext] signup error:', error);
      throw error;
    } finally {
      console.log('[AuthContext] signUp - Setting authLoading to false');
      completeAuthLoading();
    }
  };

  // Sign in function
  const signIn = async (loginData: LoginData) => {
    console.log('[AuthContext] signIn - Starting');
    try {
      setAuthLoading(true);
      const result = await AuthService.signInRestaurant(loginData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
      
    } catch (error) {
      console.error('[AuthContext] signin error:', error);
      throw error;
    } finally {
      console.log('[AuthContext] signIn - Setting authLoading to false');
      completeAuthLoading();
    }
  };

  // Sign out function
  const signOut = async () => {
    console.log('[AuthContext] signOut - Starting');
    try {
      setAuthLoading(true);
      await AuthService.signOut();
      
      setUser(null);
      setSession(null);
      setRestaurant(null);
      
    } catch (error) {
      console.error('[AuthContext] signout error:', error);
      throw error;
    } finally {
      console.log('[AuthContext] signOut - Setting authLoading to false');
      completeAuthLoading();
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    console.log('[AuthContext] resetPassword - Starting');
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('[AuthContext] reset password error:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<Restaurant>) => {
    console.log('[AuthContext] updateProfile - Starting');
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const updatedRestaurant = await AuthService.updateRestaurantProfile(user.id, updates);
      setRestaurant(updatedRestaurant);
      
    } catch (error) {
      console.error('[AuthContext] update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    restaurant,
    session,
    authLoading,
    
    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  console.log('[AuthContext] Providing context value:', { 
    user: user ? 'exists' : 'null', 
    authLoading,
    restaurant: restaurant ? 'exists' : 'null'
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  console.log('[useAuth] Hook called, returning:', { 
    user: context.user ? 'exists' : 'null', 
    authLoading: context.authLoading 
  });
  
  return context;
};

// Export for convenience
export default AuthContext;