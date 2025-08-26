// src/contexts/AuthContext.tsx - React Authentication Context
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
  loading: boolean;
  
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
  const [loading, setLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        if (session) {
          setUser(session.user);
          setSession(session);
          
          // Get restaurant profile
          const restaurantProfile = await AuthService.getRestaurantProfile(session.user.id);
          setRestaurant(restaurantProfile);
        } else {
          setUser(null);
          setSession(null);
          setRestaurant(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
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
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (signupData: SignupData) => {
    try {
      setLoading(true);
      const result = await AuthService.signUpRestaurant(signupData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
      
    } catch (error) {
      console.error('Context signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (loginData: LoginData) => {
    try {
      setLoading(true);
      const result = await AuthService.signInRestaurant(loginData);
      
      setUser(result.user);
      setSession(result.session);
      setRestaurant(result.restaurant);
      
    } catch (error) {
      console.error('Context signin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await AuthService.signOut();
      
      setUser(null);
      setSession(null);
      setRestaurant(null);
      
    } catch (error) {
      console.error('Context signout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Context reset password error:', error);
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (updates: Partial<Restaurant>) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const updatedRestaurant = await AuthService.updateRestaurantProfile(user.id, updates);
      setRestaurant(updatedRestaurant);
      
    } catch (error) {
      console.error('Context update profile error:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    // State
    user,
    restaurant,
    session,
    loading,
    
    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export for convenience
export default AuthContext;