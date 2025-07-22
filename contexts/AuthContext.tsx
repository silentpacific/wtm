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
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Email/Password Sign Up
  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            source: 'whatthemenu_signup',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      // If user was created successfully, send welcome email
      if (data.user && !data.user.email_confirmed_at) {
        console.log('New user created, sending welcome email');
        const userName = data.user.user_metadata?.full_name || 
                        data.user.user_metadata?.name || 
                        data.user.email?.split('@')[0];
        
        // Send welcome email (don't await to avoid blocking)
        sendWelcomeEmail(data.user.id, data.user.email!, userName)
          .then(success => {
            if (success) {
              console.log('✅ Welcome email sent to new user');
            } else {
              console.log('❌ Failed to send welcome email');
            }
          });
      }

      return { data, error };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Email/Password Sign In
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) throw error;
      return { data, error };
    } catch (error: any) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;
      return { data, error };
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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