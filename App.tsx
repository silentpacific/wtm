// Updated App.tsx - Background global counters, user limits only

import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicyPage, TermsOfUsePage } from './pages/LegalPages';
import { FaqPage, RefundsPolicyPage } from './pages/RefundsandFaq';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import { 
  getGlobalCounters, 
  setupRealtimeCounters,
  GlobalCounters, 
  incrementMenuScans, 
  incrementDishExplanations 
} from './services/counterService';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';



const Footer: React.FC<{ globalCounters: GlobalCounters }> = ({ globalCounters }) => (
  <footer className="bg-yellow border-t-4 border-charcoal">
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-charcoal/80">
      <p className="font-bold">
        <span className="font-black">ALWAYS</span> double-check with the restaurant regarding possible allergens.
      </p>
      
      {/* Improved mobile layout for navigation links */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 my-6 font-bold">
        <Link 
          to="/faq" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          FAQ
        </Link>
        <Link 
          to="/terms" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          Terms of Use
        </Link>
        <Link 
          to="/refunds" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          Refund Policy
        </Link>
        <Link 
          to="/privacy" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          Privacy Policy
        </Link>
        <Link 
          to="/contact" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          Contact Us
        </Link>
      </div>
      
      {/* Improved mobile layout for counters */}
      <div className="my-6">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
          <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
            <span className="text-sm font-bold">Menus Scanned: </span>
            <span className="font-black text-lg">{globalCounters.menus_scanned.toLocaleString()}</span>
          </div>
          <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
            <span className="text-sm font-bold">Dishes Explained: </span>
            <span className="font-black text-lg">{globalCounters.dish_explanations.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <p className="font-bold text-sm sm:text-base leading-relaxed">
        <span className="block sm:inline">
          &copy; {new Date().getFullYear()} What The Menu? All rights reserved.
        </span>
        <span className="block sm:inline">
          {' '}Built by{' '}
          <a 
            href="https://www.lofisimplify.com.au/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-coral transition-colors"
          >
            LoFi Simplify
          </a>
          {' '}with ❤️ in Adelaide, Australia.
        </span>
      </p>
    </div>
  </footer>
);



const AppContent: React.FC = () => {
  const location = useLocation();
  const [globalCounters, setGlobalCounters] = useState<GlobalCounters>({
    menus_scanned: 0,
    dish_explanations: 0
  });
  
  // Counter update trigger for header refresh
  const [counterUpdateTrigger, setCounterUpdateTrigger] = useState(0);

  // Track page views
  useEffect(() => {
    gtag('config', 'G-36SHN00S7N', {
      page_path: location.pathname
    });
  }, [location]);

  // Load initial global counters and set up real-time subscriptions (for analytics/footer)
  useEffect(() => {
    const loadCounters = async () => {
      try {
        const counters = await getGlobalCounters();
        setGlobalCounters(counters);
        console.log('Background global counters loaded:', counters);
      } catch (error) {
        console.error('Error loading background global counters:', error);
      }
    };

    loadCounters();

    // Set up real-time subscriptions for global counters
    const subscription = setupRealtimeCounters();
    
    // Subscribe to updates
    subscription.on('postgres_changes', async () => {
      const updatedCounters = await getGlobalCounters();
      setGlobalCounters(updatedCounters);
      console.log('Background global counters updated:', updatedCounters);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Callbacks to increment global counters and trigger header updates
  const handleScanSuccess = useCallback(async () => {
    try {
      // Increment global counter (for analytics)
      await incrementMenuScans();
      
      // Trigger header counter updates (for user limits)
      setCounterUpdateTrigger(prev => prev + 1);
      
      console.log('Scan success: global counter incremented, header updated');
    } catch (error) {
      console.error('Error updating scan counter:', error);
    }
  }, []);

  const handleExplanationSuccess = useCallback(async () => {
    try {
      // Increment global counter (for analytics)
      await incrementDishExplanations();
      
      // Trigger header counter updates (for user limits)
      setCounterUpdateTrigger(prev => prev + 1);
      
      console.log('Explanation success: global counter incremented, header updated');
    } catch (error) {
      console.error('Error updating explanation counter:', error);
    }
  }, []);

return (
  <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
    <Header onCounterUpdate={counterUpdateTrigger} />
    <main className="flex-grow">
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              onScanSuccess={handleScanSuccess}
              onExplanationSuccess={handleExplanationSuccess}
            />
          } 
        />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfUsePage />} />
        <Route path="/faq" element={<FaqPage />} />
	<Route path="/refunds" element={<RefundsPolicyPage />} />

        
        {/* ADD THESE TWO NEW ROUTES */}
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
        <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
      </Routes>
    </main>
    <Footer globalCounters={globalCounters} />
  </div>
);
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;