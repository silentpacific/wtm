import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUpWithMagicLink: (email: string) => Promise<any>;
  signInWithMagicLink: (email: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

// Function to send welcome email
const sendWelcomeEmail = async (userId: string, email: string, name?: string) => {
  try {
    const response = await fetch('/.netlify/functions/auth-welcome-email', {
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
          
          // Check if this is a new user by looking at user metadata
          const isNewUser = session.user.user_metadata?.new_user || 
                           session.user.email_confirmed_at === session.user.created_at;
          
          if (isNewUser) {
            console.log('New user detected, sending welcome email');
            
            // Get user's name from metadata or email
            const userName = session.user.user_metadata?.full_name || 
                           session.user.user_metadata?.name || 
                           session.user.email?.split('@')[0];
            
            // Send welcome email (don't await to avoid blocking)
            sendWelcomeEmail(session.user.id, session.user.email!, userName)
              .then(success => {
                if (success) {
                  console.log('✅ Welcome email sent to new user');
                } else {
                  console.log('❌ Failed to send welcome email');
                }
              });
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

  const signUpWithMagicLink = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        shouldCreateUser: true, // This allows new user creation
      }
    });
  };

  const signInWithMagicLink = async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}`,
        shouldCreateUser: false, // This prevents new user creation for sign-in
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user, 
      session, 
      loading, 
      signUpWithMagicLink, 
      signInWithMagicLink, 
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};