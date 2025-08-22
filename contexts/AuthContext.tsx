import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// Function to send welcome email
const sendWelcomeEmail = async (userId: string, email: string, name?: string) => {
  try {
    const response = await fetch('/.netlify/functions/welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        name
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send welcome email:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Welcome email sent:', result.message);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in successfully');
          
          // FIXED: Ensure we have a valid user ID before creating profile
          if (session.user.id && typeof session.user.id === 'string') {
            try {
              // Try to get or create user profile with error handling
              const { getOrCreateEnhancedUserProfile } = await import('../services/enhancedUsageTracking');
              await getOrCreateEnhancedUserProfile(session.user.id, session.user.email);
              console.log('✅ User profile initialized');
            } catch (error) {
              console.error('❌ Error initializing user profile:', error);
              // Don't block sign-in if profile creation fails
            }
          } else {
            console.error('❌ Invalid user ID in session:', session.user.id);
          }
          
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // FIXED: Email/Password Sign Up with better error handling and user ID validation
  const signUp = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const cleanEmail = email.trim().toLowerCase();
      
      // First, create the account
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            source: 'whatthemenu_signup',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (signUpError) throw signUpError;

      // Validate that we got a user back
      if (!signUpData.user || !signUpData.user.id) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ User account created:', signUpData.user.id);

      // Immediately sign them in (no email verification required)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (signInError) {
        // If sign in fails, it might be because email confirmation is required
        console.log('Auto sign-in failed, email confirmation may be required:', signInError);
        return { data: signUpData, error: null };
      }

      // Validate sign-in data
      if (!signInData.user || !signInData.user.id) {
        console.error('❌ Invalid sign-in data:', signInData);
        return { data: signUpData, error: null };
      }

      console.log('✅ User created and automatically signed in');

      // Send welcome email (don't await to avoid blocking)
      if (signUpData.user && signUpData.user.email) {
        const userName = signUpData.user.user_metadata?.full_name || 
                        signUpData.user.user_metadata?.name || 
                        signUpData.user.email.split('@')[0];
        
        sendWelcomeEmail(signUpData.user.id, signUpData.user.email, userName)
          .then(success => {
            if (success) {
              console.log('✅ Welcome email sent to new user');
            } else {
              console.log('⚠️ Failed to send welcome email');
            }
          })
          .catch(error => {
            console.error('❌ Error sending welcome email:', error);
          });
      }

      return { data: signInData, error: null };
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      throw error;
    }
  };

  // FIXED: Email/Password Sign In with better validation
  const signIn = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const cleanEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) throw error;
      
      // Validate that we got a user back
      if (!data.user || !data.user.id) {
        throw new Error('Invalid sign-in response');
      }

      console.log('✅ User signed in successfully:', data.user.id);
      return { data, error };
    } catch (error: any) {
      console.error('❌ Signin error:', error);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      if (!email) {
        throw new Error('Email is required');
      }

      const cleanEmail = email.trim().toLowerCase();
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;
      return { data, error };
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};