// src/pages/PaymentCancelledPage.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();

  // Function to navigate to pricing section with proper scroll positioning
  const handleViewPlansClick = () => {
    navigate('/');
    
    // Wait for navigation to complete, then scroll to pricing section
    setTimeout(() => {
      const pricingSection = document.querySelector('#pricing-section');
      if (pricingSection) {
        // Get the position of the pricing section
        const rect = pricingSection.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top;
        
        // Scroll to 20 pixels above the section (accounting for sticky header)
        const headerHeight = 80; // Approximate header height
        const extraPadding = 20; // 20 pixels above as requested
        const targetPosition = absoluteTop - headerHeight - extraPadding;
        
        window.scrollTo({ 
          top: Math.max(0, targetPosition), // Ensure we don't scroll to negative position
          behavior: 'smooth' 
        });
      } else {
        // Fallback: scroll to bottom where pricing usually is
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure navigation is complete
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border-4 border-charcoal rounded-2xl p-8 text-center shadow-[8px_8px_0px_#292524]">
          {/* Cancel Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-yellow-500">
            <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-black text-charcoal mb-4">Payment Cancelled</h1>
          <p className="text-charcoal/80 mb-6 text-lg">
            No worries! Your payment was cancelled and you haven't been charged.
          </p>

          {/* Free Options Reminder */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2">Still want to try us?</h3>
            <p className="text-sm text-blue-700">
              You still have <strong>free scans available</strong>! Try the app first, then upgrade when you're ready.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              to="/" 
              onClick={() => window.scrollTo(0, 0)}
              className="block w-full py-3 bg-coral text-white font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              Try Free Scans
            </Link>
            
            <button 
              onClick={handleViewPlansClick}
              className="block w-full py-3 bg-yellow text-charcoal font-bold rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
            >
              View Plans Again
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/60">
            Need help deciding? <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="text-coral underline">Contact us</Link> or <Link to="/faq" onClick={() => window.scrollTo(0, 0)} className="text-coral underline">check our FAQ</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;