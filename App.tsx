// Fixed App.tsx with correct imports and component names
import React, { useState, useCallback, useEffect, type FC } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import UserProfile from './pages/UserProfile';
import AuthVerify from './pages/AuthVerify';
// FIXED: Import correct component names
import { PrivacyPolicyPage, TermsOfUsePage } from './pages/LegalPages';
import { FaqPage, RefundsPolicyPage } from './pages/RefundsandFaq';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import { getAnonymousUsage } from './services/anonymousUsageTracking';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import AccessMenuTest from './components/AccessMenuTest';
import RestaurantQRPage from './pages/RestaurantQRPage';
import './services/errorBoundary';
import QRCodeGenerator from './components/QRCodeGenerator';
import RestaurantLandingPage from './pages/RestaurantLandingPage';
import ConsumersPage from './pages/ConsumersPage';


const Footer: FC<{ globalCounters: GlobalCounters }> = ({ globalCounters }) => {
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [legalExpanded, setLegalExpanded] = useState(false);

  const toggleAbout = () => {
    setAboutExpanded(prev => !prev);
  };

  const toggleLegal = () => {
    setLegalExpanded(prev => !prev);
  };

  return (
    <footer style={{ backgroundColor: '#F5F5F0' }} className="border-t-4 border-charcoal">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Row 1: Warning Statement */}
        <div className="py-6 border-b-4 border-charcoal/20">
          <div className="bg-yellow/20 border-4 border-yellow rounded-2xl p-4 shadow-[4px_4px_0px_#292524]">
            <p className="text-charcoal text-center leading-relaxed font-bold">
              <span className="font-black">⚠️ Warning:</span> The information provided by WhatTheMenu? is for informational purposes only and should not be considered medical or dietary advice. Always consult with a qualified professional for personalized guidance.
            </p>
          </div>
        </div>

        {/* Row 2: Three Columns (Desktop) / Accordions + Counters (Mobile) */}
        <div className="py-8">
          
          {/* Desktop Layout - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-8">
            
            {/* Column 1: About */}
            <div>
              <h3 className="text-2xl font-black text-charcoal mb-4 tracking-tight">About</h3>
              <nav aria-label="About navigation">
                <ul className="space-y-3">
                  <li>
                    <Link 
                      to="/faq" 
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-charcoal/80 hover:text-coral font-bold text-lg hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/contact" 
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-charcoal/80 hover:text-coral font-bold text-lg hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Column 2: Legal */}
            <div>
              <h3 className="text-2xl font-black text-charcoal mb-4 tracking-tight">Legal</h3>
              <nav aria-label="Legal navigation">
                <ul className="space-y-3">
                  <li>
                    <Link 
                      to="/terms" 
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-charcoal/80 hover:text-coral font-bold text-lg hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/refunds" 
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-charcoal/80 hover:text-coral font-bold text-lg hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                    >
                      Refunds
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/privacy-policy" 
                      onClick={() => window.scrollTo(0, 0)}
                      className="text-charcoal/80 hover:text-coral font-bold text-lg hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                    >
                      Privacy
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Column 3: Live Counters */}
            <div>
              <h3 className="text-2xl font-black text-charcoal mb-4 tracking-tight">Live Counters</h3>
              <div className="space-y-3">
                <div className="bg-white border-4 border-charcoal rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#292524]">
                  <p className="text-sm font-bold text-charcoal/80">Menus Scanned:</p>
                  <p className="text-2xl font-black text-charcoal">{(globalCounters.menus_scanned || 0).toLocaleString()}</p>
                </div>
                <div className="bg-white border-4 border-charcoal rounded-2xl px-4 py-3 shadow-[4px_4px_0px_#292524]">
                  <p className="text-sm font-bold text-charcoal/80">Dishes Analyzed:</p>
                  <p className="text-2xl font-black text-charcoal">{(globalCounters.dish_explanations || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Layout - Visible only on mobile */}
          <div className="md:hidden space-y-4">
            
            {/* About Accordion */}
            <div className="border-4 border-charcoal rounded-2xl shadow-[4px_4px_0px_#292524]">
              <button
                onClick={toggleAbout}
                aria-expanded={aboutExpanded}
                aria-controls="about-content"
                className="w-full px-4 py-3 text-left font-black text-charcoal bg-white hover:bg-cream focus:bg-cream focus:outline-none transition-colors flex justify-between items-center rounded-t-xl"
              >
                About
                <span className={`transition-transform duration-200 text-xl ${aboutExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {aboutExpanded && (
                <div id="about-content" className="px-4 py-3 bg-cream border-t-2 border-charcoal rounded-b-xl">
                  <nav aria-label="About navigation">
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          to="/faq" 
                          onClick={() => window.scrollTo(0, 0)}
                          className="block text-charcoal/80 hover:text-coral font-bold hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                        >
                          FAQ
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/contact" 
                          onClick={() => window.scrollTo(0, 0)}
                          className="block text-charcoal/80 hover:text-coral font-bold hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                        >
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* Legal Accordion */}
            <div className="border-4 border-charcoal rounded-2xl shadow-[4px_4px_0px_#292524]">
              <button
                onClick={toggleLegal}
                aria-expanded={legalExpanded}
                aria-controls="legal-content"
                className="w-full px-4 py-3 text-left font-black text-charcoal bg-white hover:bg-cream focus:bg-cream focus:outline-none transition-colors flex justify-between items-center rounded-t-xl"
              >
                Legal
                <span className={`transition-transform duration-200 text-xl ${legalExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>
              {legalExpanded && (
                <div id="legal-content" className="px-4 py-3 bg-cream border-t-2 border-charcoal rounded-b-xl">
                  <nav aria-label="Legal navigation">
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          to="/terms" 
                          onClick={() => window.scrollTo(0, 0)}
                          className="block text-charcoal/80 hover:text-coral font-bold hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                        >
                          Terms
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/refunds" 
                          onClick={() => window.scrollTo(0, 0)}
                          className="block text-charcoal/80 hover:text-coral font-bold hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                        >
                          Refunds
                        </Link>
                      </li>
                      <li>
                        <Link 
                          to="/privacy-policy" 
                          onClick={() => window.scrollTo(0, 0)}
                          className="block text-charcoal/80 hover:text-coral font-bold hover:underline focus:text-coral focus:underline focus:outline-none transition-colors"
                        >
                          Privacy
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>

            {/* Live Counters Block (Mobile) */}
            <div className="bg-white border-4 border-charcoal rounded-2xl p-4 shadow-[4px_4px_0px_#292524]">
              <h3 className="text-xl font-black text-charcoal mb-3 tracking-tight">Live Counters</h3>
              <div className="space-y-2">
                <p className="text-charcoal/80">
                  <span className="font-bold">Menus Scanned:</span> 
                  <span className="font-black text-charcoal ml-1">{(globalCounters.menus_scanned || 0).toLocaleString()}+</span>
                </p>
                <p className="text-charcoal/80">
                  <span className="font-bold">Dishes Analyzed:</span> 
                  <span className="font-black text-charcoal ml-1">{(globalCounters.dish_explanations || 0).toLocaleString()}+</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: Copyright Statement */}
        <div className="py-6 border-t-4 border-charcoal/20">
          <p className="text-center text-charcoal/80 font-bold">
            © 2025 WhatTheMenu? All rights reserved. Built with ❤️ in Adelaide, Australia.
          </p>
        </div>
      </div>
    </footer>
  );
};

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

  // Scroll to top on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Track page views
  useEffect(() => {
    if (typeof gtag !== 'undefined') {
      gtag('config', 'G-36SHN00S7N', {
        page_path: location.pathname
      });
    }
  }, [location]);

  // Load initial global counters and restore real-time subscriptions
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

    // RESTORED: Real-time subscriptions with proper error handling
    try {
      const { unsubscribe } = subscribeToCounters((updatedCounters) => {
        console.log('✅ Global counters updated via subscription:', updatedCounters);
        setGlobalCounters(updatedCounters);
      });

      // Return cleanup function
      return () => {
        try {
          if (unsubscribe && typeof unsubscribe === 'function') {
            unsubscribe();
          }
        } catch (error) {
          console.error('Error during subscription cleanup:', error);
        }
      };
    } catch (subscriptionError) {
      console.error('Error setting up real-time subscription:', subscriptionError);
      // Continue without real-time if subscription fails
    }
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
		  {/* Homepage - Now Restaurant Landing Page */}
		  <Route path="/" element={<RestaurantLandingPage />} />
		  
		  {/* Restaurant Routes (B2B) */}
		  <Route path="/restaurants" element={<RestaurantLandingPage />} />
		  {/* Future restaurant routes will go here:
		  <Route path="/restaurants/signup" element={<RestaurantSignup />} />
		  <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
		  <Route path="/restaurant/menu" element={<RestaurantMenuEditor />} />
		  */}
		  
		  {/* Consumer Routes (Demo/Preserved) */}
		  <Route path="/consumers" element={<ConsumersPage />} />
		  <Route path="/profile" element={<UserProfile />} />
		  
		  {/* Restaurant Menu Access Routes */}
		  <Route path="/r/:restaurantSlug" element={<AccessMenuTest />} />
		  <Route path="/access-menu/:restaurantId" element={<AccessMenuTest />} />
		  
		  {/* Shared Routes */}
		  <Route path="/contact" element={<ContactPage />} />
		  <Route path="/faq" element={<RefundsandFaq />} />
		  <Route path="/refunds" element={<RefundsandFaq />} />
		  
		  {/* Legal Pages */}
		  <Route path="/terms" element={<LegalPages />} />
		  <Route path="/privacy" element={<LegalPages />} />
		  
		  {/* Legacy Redirects (to preserve old bookmarks) */}
		  <Route path="/demo" element={<Navigate to="/consumers" replace />} />
		  <Route path="/home" element={<Navigate to="/" replace />} />
		  
		  {/* Keep any other existing routes you have */}
		  <Route path="/auth-verify" element={<AuthVerify />} />
		  <Route path="/payment-success" element={<PaymentSuccessPage />} />
		  <Route path="/payment-cancelled" element={<PaymentCancelledPage />} />
		  {/* ... any other routes you currently have ... */}
		  
		  {/* Catch-all redirect to homepage */}
		  <Route path="*" element={<Navigate to="/" replace />} />
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