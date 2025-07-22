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

// Rate limiting storage for email requests
interface RateLimitInfo {
  lastRequest: number;
  requestCount: number;
  email: string;
}

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 requests per minute per email
const MIN_REQUEST_INTERVAL = 10000; // Min 10 seconds between requests

// Get rate limit info from localStorage
const getRateLimitInfo = (email: string): RateLimitInfo => {
  try {
    const stored = localStorage.getItem(`rate_limit_${email}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Error reading rate limit info:', error);
  }
  
  return {
    lastRequest: 0,
    requestCount: 0,
    email
  };
};

// Set rate limit info to localStorage
const setRateLimitInfo = (email: string, info: RateLimitInfo): void => {
  try {
    localStorage.setItem(`rate_limit_${email}`, JSON.stringify(info));
  } catch (error) {
    console.warn('Error storing rate limit info:', error);
  }
};

// Check if request is allowed based on rate limiting
const isRequestAllowed = (email: string): { allowed: boolean; waitTime?: number } => {
  const info = getRateLimitInfo(email);
  const now = Date.now();
  
  // Reset counter if window has passed
  if (now - info.lastRequest > RATE_LIMIT_WINDOW) {
    info.requestCount = 0;
  }
  
  // Check minimum interval between requests
  const timeSinceLastRequest = now - info.lastRequest;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    return {
      allowed: false,
      waitTime: Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000)
    };
  }
  
  // Check maximum requests per window
  if (info.requestCount >= MAX_REQUESTS_PER_WINDOW) {
    const windowResetTime = info.lastRequest + RATE_LIMIT_WINDOW;
    if (now < windowResetTime) {
      return {
        allowed: false,
        waitTime: Math.ceil((windowResetTime - now) / 1000)
      };
    }
    // Window has reset
    info.requestCount = 0;
  }
  
  return { allowed: true };
};

// Update rate limit info after a request
const updateRateLimitInfo = (email: string): void => {
  const info = getRateLimitInfo(email);
  const now = Date.now();
  
  // Reset counter if window has passed
  if (now - info.lastRequest > RATE_LIMIT_WINDOW) {
    info.requestCount = 0;
  }
  
  info.lastRequest = now;
  info.requestCount += 1;
  info.email = email;
  
  setRateLimitInfo(email, info);
};

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
    // Check rate limiting
    const rateLimitCheck = isRequestAllowed(email);
    if (!rateLimitCheck.allowed) {
      const waitTime = rateLimitCheck.waitTime || 60;
      throw new Error(`Too many requests. Please wait ${waitTime} seconds before trying again.`);
    }

    try {
      // Update rate limit info before making request
      updateRateLimitInfo(email);
      
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          shouldCreateUser: true, // This allows new user creation
        }
      });

      // Handle Supabase rate limiting response
      if (result.error) {
        if (result.error.message.includes('rate') || result.error.message.includes('limit') || result.error.status === 429) {
          throw new Error('Email sending rate limit reached. Please wait a few minutes before requesting another magic link.');
        }
        throw result.error;
      }

      return result;
    } catch (error: any) {
      // Handle different types of rate limiting errors
      if (error.message.includes('rate') || error.message.includes('limit') || error.status === 429) {
        throw new Error('Email sending rate limit reached. Please wait a few minutes before requesting another magic link.');
      }
      throw error;
    }
  };

  const signInWithMagicLink = async (email: string) => {
    // Check rate limiting
    const rateLimitCheck = isRequestAllowed(email);
    if (!rateLimitCheck.allowed) {
      const waitTime = rateLimitCheck.waitTime || 60;
      throw new Error(`Too many requests. Please wait ${waitTime} seconds before trying again.`);
    }

    try {
      // Update rate limit info before making request
      updateRateLimitInfo(email);
      
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}`,
          shouldCreateUser: false, // This prevents new user creation for sign-in
        }
      });

      // Handle Supabase rate limiting response
      if (result.error) {
        if (result.error.message.includes('rate') || result.error.message.includes('limit') || result.error.status === 429) {
          throw new Error('Email sending rate limit reached. Please wait a few minutes before requesting another magic link.');
        }
        throw result.error;
      }

      return result;
    } catch (error: any) {
      // Handle different types of rate limiting errors
      if (error.message.includes('rate') || error.message.includes('limit') || error.status === 429) {
        throw new Error('Email sending rate limit reached. Please wait a few minutes before requesting another magic link.');
      }
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
      signUpWithMagicLink, 
      signInWithMagicLink, 
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};