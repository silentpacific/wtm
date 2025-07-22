// Updated App.tsx - Added anonymous counter tracking for Header

import React, { useState, useCallback, useEffect, type FC } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import { PrivacyPolicyPage, TermsOfUsePage } from './pages/LegalPages';
import { FaqPage, RefundsPolicyPage } from './pages/RefundsandFaq';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import { 
  getGlobalCounters, 
  setupRealtimeCounters,
  GlobalCounters, 
  incrementMenuScans, 
  incrementDishExplanations,
  subscribeToCounters
} from './services/counterService';
import { getAnonymousUsage } from './services/anonymousUsageTracking';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

// Updated Footer component with new URLs
const Footer: FC<{ globalCounters: GlobalCounters }> = ({ globalCounters }) => (
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
          to="/refund-policy" 
          onClick={() => window.scrollTo(0, 0)}
          className="hover:text-charcoal px-2 py-1"
        >
          Refund Policy
        </Link>
        <Link 
          to="/privacy-policy" 
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

const AppContent: FC = () => {
  const location = useLocation();
  const [globalCounters, setGlobalCounters] = useState<GlobalCounters>({
    menus_scanned: 0,
    dish_explanations: 0
  });
  
  // Counter update trigger for header refresh
  const [counterUpdateTrigger, setCounterUpdateTrigger] = useState(0);
  
  // Anonymous counters state for header
  const [anonymousCounters, setAnonymousCounters] = useState({
    scans_used: 0,
    scans_limit: 5,
    current_menu_dish_explanations: 0
  });

  // Load anonymous counters on component mount and set up localStorage listener
  useEffect(() => {
    const loadAnonymousCounters = () => {
      const usage = getAnonymousUsage();
      setAnonymousCounters({
        scans_used: usage.scansUsed,
        scans_limit: 5,
        current_menu_dish_explanations: usage.currentMenuDishExplanations
      });
    };

    // Load initial counters
    loadAnonymousCounters();

    // Listen for localStorage changes (when anonymous counters update)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'anonymousUsage') {
        loadAnonymousCounters();
      }
    };

    // Listen for custom events (when localStorage is updated from same tab)
    const handleAnonymousUpdate = () => {
      loadAnonymousCounters();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('anonymousCountersUpdated', handleAnonymousUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('anonymousCountersUpdated', handleAnonymousUpdate);
    };
  }, []);

  // Scroll to top on route changes - THIS IS THE FIX FOR ISSUE #3
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track page views
  useEffect(() => {
    gtag('config', 'G-36SHN00S7N', {
      page_path: location.pathname
    });
  }, [location]);

  // Load initial global counters and set up subscriptions
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

    // Subscribe to the manual updates from the counter service
    const { unsubscribe } = subscribeToCounters((updatedCounters) => {
      console.log('✅ Global counters updated via subscription:', updatedCounters);
      setGlobalCounters(updatedCounters);
    });

    // Unsubscribe when the component unmounts to prevent memory leaks
    return () => {
      unsubscribe();
    };
  }, []);

  // Callbacks to increment global counters and trigger header updates
  const handleScanSuccess = useCallback(async () => {
    try {
      // Increment global counter (for analytics)
      await incrementMenuScans();
      
      // Trigger header counter updates (for user limits)
      setCounterUpdateTrigger(prev => prev + 1);
      
      // Update anonymous counters immediately for responsive UI
      const usage = getAnonymousUsage();
      setAnonymousCounters({
        scans_used: usage.scansUsed,
        scans_limit: 5,
        current_menu_dish_explanations: usage.currentMenuDishExplanations
      });
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('anonymousCountersUpdated'));
      
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
      
      // Update anonymous counters immediately for responsive UI
      const usage = getAnonymousUsage();
      setAnonymousCounters({
        scans_used: usage.scansUsed,
        scans_limit: 5,
        current_menu_dish_explanations: usage.currentMenuDishExplanations
      });
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('anonymousCountersUpdated'));
      
      console.log('Explanation success: global counter incremented, header updated');
    } catch (error) {
      console.error('Error updating explanation counter:', error);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
      <Header 
        onCounterUpdate={counterUpdateTrigger} 
        anonymousCounters={anonymousCounters}
      />
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
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/refund-policy" element={<RefundsPolicyPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
        </Routes>
      </main>
      <Footer globalCounters={globalCounters} />
    </div>
  );
};

const App: FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;