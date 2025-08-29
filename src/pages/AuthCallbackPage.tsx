// src/pages/AuthCallbackPage.tsx
import { useEffect } from "react";
import { supabase } from '../services/supabaseClient';
import { useNavigate } from "react-router-dom";

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure session is refreshed after redirect
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("Session after redirect:", data, error);
      if (data.session) {
        // Redirect to dashboard or home after login confirmation
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your account...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
