import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import { PrivacyPolicyPage, TermsOfUsePage, FaqPage } from './pages/LegalPages';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginModal } from './components/LoginModal';
import { getGlobalCounters, subscribeToCounters, GlobalCounters } from './services/counterService';

const Header: React.FC<{ userScans: number }> = ({ userScans }) => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <header className="bg-cream/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b-4 border-charcoal">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-3xl font-black text-charcoal tracking-tighter">
                WhatTheMenu?
              </Link>
              <nav className="hidden md:flex space-x-6">
                <NavLink to="/faq" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>FAQ</NavLink>
                <NavLink to="/contact" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>Contact</NavLink>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 border-4 border-charcoal rounded-full shadow-[4px_4px_0px_#292524]">
                <span className="font-bold text-sm">Free Scans:</span>
                <span className="font-black text-lg">{userScans}/5</span>
              </div>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="hidden sm:inline text-sm font-bold text-charcoal/70">
                    Welcome, {user.email?.split('@')[0]}
                  </span>
                  <button 
                    onClick={signOut}
                    className="px-6 py-2 text-lg font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="hidden sm:inline-block px-6 py-2 text-lg font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-6 py-3 text-lg font-bold text-white bg-coral rounded-full border-4 border-charcoal shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-[0px_0px_0px_#292524] active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

const Footer: React.FC<{ globalCounters: GlobalCounters }> = ({ globalCounters }) => (
  <footer className="bg-yellow border-t-4 border-charcoal">
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-charcoal/80">
      <p className="font-bold">
        Powered by Google Gemini. Descriptions are AI-generated. Always double-check with the restaurant regarding possible allergens.
      </p>
      <div className="flex justify-center space-x-6 my-4 font-bold">
        <Link to="/privacy" className="hover:text-charcoal">Privacy Policy</Link>
        <Link to="/terms" className="hover:text-charcoal">Terms of Use</Link>
        <Link to="/contact" className="hover:text-charcoal">Contact Us</Link>
      </div>
      
      {/* Enhanced counters section */}
      <div className="my-4 space-y-2">
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
      
      <p className="font-bold">&copy; {new Date().getFullYear()} What The Menu? Built by <a href="https://www.lofisimplify.com.au/" target="_blank" rel="noopener noreferrer" className="underline hover:text-coral transition-colors">LoFi Simplify</a> with ❤️ in Adelaide. All rights reserved.</p>
    </div>
  </footer>
);

const AppContent: React.FC = () => {
  const location = useLocation();
  const [globalCounters, setGlobalCounters] = useState<GlobalCounters>({
    menus_scanned: 1337,
    dish_explanations: 0
  });
  const [userScans, setUserScans] = useState(3);

  // Track page views
  useEffect(() => {
    gtag('config', 'G-36SHN00S7N', {
      page_path: location.pathname
    });
  }, [location]);

  // Load initial counters and subscribe to changes
  useEffect(() => {
    const loadCounters = async () => {
      const counters = await getGlobalCounters();
      setGlobalCounters(counters);
    };

    loadCounters();

    // Subscribe to real-time updates
    const subscription = subscribeToCounters((newCounters) => {
      setGlobalCounters(newCounters);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const incrementScans = useCallback(() => {
    // The actual counter increment will be handled in HomePage component
    // This is just for the local user scan counter display
    // setUserScans(prev => Math.min(prev + 1, 5));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cream text-charcoal font-sans">
      <Header userScans={userScans} />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage onScanSuccess={incrementScans} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/faq" element={<FaqPage />} />
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