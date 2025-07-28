// src/pages/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ShareWidget from '../components/ShareWidget';


const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Verify payment session
    const verifyPayment = async () => {
      if (!sessionId || !user) {
        setIsVerifying(false);
        return;
      }

      try {
        // Optional: Verify the session on your backend
        // This adds extra security but the webhook should handle most cases
        const response = await fetch(`/.netlify/functions/verify-payment?session_id=${sessionId}`);
        if (response.ok) {
          setPaymentVerified(true);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
      } finally {
        setIsVerifying(false);
      }
    };

    // Add a small delay to let the webhook process
    const timer = setTimeout(verifyPayment, 2000);
    return () => clearTimeout(timer);
  }, [sessionId, user]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-coral mb-4"></div>
          <h2 className="text-2xl font-bold text-charcoal">Verifying your payment...</h2>
          <p className="text-charcoal/70 mt-2">This will just take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-charcoal rounded-2xl p-8 text-center shadow-[8px_8px_0px_#292524]">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500">
            <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-black text-charcoal mb-4">Payment Successful!</h1>
          <p className="text-charcoal/80 mb-6 text-lg">
            🎉 Increased Scanning Limits! Your subscription is now active and ready to use.
          </p>

          {/* Benefits */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-green-800 mb-2">What you get:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✨ More menu scans</li>
              <li>🍽️ Unlimited dish explanations</li>
              <li>🌍 All languages supported</li>
              <li>⚡ Priority support</li>
            </ul>
          </div>
		  
		{/* NEW: Share Widget */}
          <div className="mb-6">
            <ShareWidget 
              location="payment-success" 
              size="medium"
              orientation="vertical"
              userType="authenticated"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full py-3 bg-coral text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Start Scanning Menus!
            </Link>
            
            <p className="text-sm text-charcoal/60">
              Your subscription details have been sent to your email
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/60">
            Questions? <Link to="/contact" className="text-coral underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;