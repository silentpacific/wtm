// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("🔑 Supabase getSession:", data, error);

      if (error) {
        console.error("❌ Error getting session:", error);
        setUser(null);
      } else {
        setUser(data.session?.user || null);
      }
      setAuthLoading(false);
    };

    getSession();

    // Listen for login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("📡 Auth state change:", _event, session);
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("🚪 Signing out");
    await supabase.auth.signOut();
    setUser(null);
  };

  console.log("👤 AuthContext state → user:", user, "authLoading:", authLoading);

  return (
    <AuthContext.Provider value={{ user, authLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
