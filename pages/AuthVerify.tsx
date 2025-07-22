// Create: pages/AuthVerify.tsx (or add to your routing)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthVerify: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Get parameters from URL
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const signature = params.get('signature');
        const email = params.get('email');

        if (!token || !signature || !email) {
          setStatus('error');
          setMessage('Invalid magic link. Please request a new one.');
          return;
        }

        // Verify the token
        const response = await fetch('/.netlify/functions/verify-magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            signature,
            email: decodeURIComponent(email)
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to verify magic link');
          return;
        }

        // Success! Redirect to Supabase callback URL
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setStatus('success');
          setMessage(data.message || 'Authentication successful');
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            navigate('/');
          }, 2000);
        }

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    verifyToken();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 border-4 border-charcoal shadow-[8px_8px_0px_#292524] w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-coral mx-auto mb-6"></div>
            <h2 className="text-2xl font-black text-charcoal mb-4">Verifying Magic Link</h2>
            <p className="text-charcoal/70">Please wait while we sign you in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-black text-charcoal mb-4">Success!</h2>
            <p className="text-charcoal/70 mb-4">{message}</p>
            <p className="text-sm text-charcoal/60">Redirecting you to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-2xl font-black text-charcoal mb-4">Verification Failed</h2>
            <p className="text-charcoal/70 mb-6">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 transition-colors shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthVerify;