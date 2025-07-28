import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getUserCounters, UserCounters, subscribeToCounters } from '../services/counterService';

interface HeaderProps {
  onCounterUpdate?: number; // Trigger to refresh counters
  anonymousCounters?: {
    scans_used: number;
    scans_limit: number;
    current_menu_dish_explanations: number;
  }; // For anonymous users
}

// Helper function to check if subscription is expired
const checkSubscriptionExpiry = (counters: UserCounters | null): boolean => {
  if (!counters?.subscription_expires_at) return false;
  
  const now = new Date();
  const expiresAt = new Date(counters.subscription_expires_at);
  
  return now >= expiresAt;
};

const Header: React.FC<HeaderProps> = ({ onCounterUpdate, anonymousCounters }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);
  const [userCounters, setUserCounters] = useState<UserCounters>({
    scans_used: 0,
    scans_limit: 5,
    current_menu_dish_explanations: 0,
    subscription_type: 'free'
  });
  const [isLoadingCounters, setIsLoadingCounters] = useState(false);

  // Fixed logo click handler
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Force navigation to home page
    if (location.pathname !== '/') {
      window.location.href = '/';
    } else {
      // If already on home, scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fixed pricing click handler
  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (location.pathname === '/') {
      // If already on home page, scroll to pricing section
      const pricingElement = document.getElementById('pricing-section');
      if (pricingElement) {
        pricingElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If not on home page, navigate to home with hash
      window.location.href = '/#pricing-section';
    }
    closeMobileMenu();
  };

  // Memoized function to load user counters
  const loadUserCounters = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingCounters(true);
    try {
      const counters = await getUserCounters(user.id);
      
      // Check if subscription just expired and show notification
      if (checkSubscriptionExpiry(counters) && counters.subscription_type !== 'free') {
        console.log('⚠️ Subscription expired, showing user notification');
        setShowExpiryWarning(true);
      }
      
      setUserCounters(counters);
      console.log('📊 Header counters updated:', counters);
    } catch (error) {
      console.error('Error loading user counters in header:', error);
      // Keep existing counters on error instead of resetting
    } finally {
      setIsLoadingCounters(false);
    }
  }, [user]);

  // Get effective counters (authenticated user counters or anonymous counters)
  const effectiveCounters = user ? userCounters : {
    scans_used: anonymousCounters?.scans_used || 0,
    scans_limit: anonymousCounters?.scans_limit || 5,
    current_menu_dish_explanations: anonymousCounters?.current_menu_dish_explanations || 0,
    subscription_type: 'free'
  };

  // Helper function to check if user has unlimited dish explanations
  const hasUnlimitedDishExplanations = useCallback(() => {
    if (!user || !userCounters.subscription_expires_at || !userCounters.subscription_status) {
      return false;
    }
    
    // Check if subscription is active and not expired
    if (userCounters.subscription_status === 'active') {
      const now = new Date();
      const expiresAt = new Date(userCounters.subscription_expires_at);
      
      if (now < expiresAt) {
        return ['daily', 'weekly'].includes(userCounters.subscription_type.toLowerCase());
      }
    }
    
    return false;
  }, [user, userCounters]);

  // Load user counters when user changes or when triggered
  useEffect(() => {
    if (user) {
      loadUserCounters();
    }
  }, [user, loadUserCounters]);

  // Refresh counters when onCounterUpdate prop changes
  useEffect(() => {
    if (user && onCounterUpdate !== undefined) {
      loadUserCounters();
    }
  }, [onCounterUpdate, user, loadUserCounters]);

  // Set up real-time subscription for counter updates
  useEffect(() => {
    if (!user) return;

    const subscription = subscribeToCounters(() => {
      // When global counters change, refresh user counters too
      loadUserCounters();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, loadUserCounters]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      closeMobileMenu();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Function to get display text for subscription type
  const getSubscriptionDisplayText = (subType: string) => {
    switch (subType.toLowerCase()) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'free':
      default:
        return 'Free';
    }
  };

  // Function to format dish explanations display
  const formatDishExplanationsDisplay = () => {
    const count = effectiveCounters.current_menu_dish_explanations;
    
    if (user && hasUnlimitedDishExplanations()) {
      // Paid users: just show the count (no limit)
      return count.toString();
    } else {
      // Free users: show count/5
      return `${count}/5`;
    }
  };

  return (
    <>
      {/* Expiration Warning - Fixed positioned at top */}
      {showExpiryWarning && (
        <div className="fixed top-20 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow-lg z-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm">
                Your subscription has expired. You've been moved back to the free tier with 5 fresh scans.
              </p>
              <button
                onClick={() => setShowExpiryWarning(false)}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-cream/80 backdrop-blur-sm border-b-4 border-charcoal fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main header row */}
          <div className="flex justify-between items-center py-4">
            {/* Left side - Hamburger (mobile) */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none mr-4"
                aria-label="Toggle menu"
              >
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>

            {/* Center - Logo (Fixed with proper click handling) */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center group flex-1 lg:flex-none justify-center lg:justify-start focus:outline-none"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-charcoal group-hover:text-coral transition-colors">
                WhatTheMenu?
              </h1>
            </button>

            {/* Desktop Navigation Links (Fixed with proper click handlers) */}
            <div className="hidden lg:flex items-center space-x-6 flex-1 justify-center">
              <button 
                onClick={handleLogoClick}
                className="font-bold text-charcoal hover:text-coral transition-colors focus:outline-none"
              >
                Home
              </button>
              
              <button
                onClick={handlePricingClick}
                className="font-bold text-charcoal hover:text-coral transition-colors focus:outline-none"
              >
                Pricing
              </button>
              
              <Link 
                to="/faq"
                className="font-bold text-charcoal hover:text-coral transition-colors"
              >
                FAQ
              </Link>
              
              <Link 
                to="/contact"
                className="font-bold text-charcoal hover:text-coral transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Desktop Pills - Show for both authenticated and anonymous users */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Menus Scanned Pill */}
              <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                <span className="font-bold">Menus scanned: </span>
                {isLoadingCounters && user ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span className="font-black">{effectiveCounters.scans_used}/{effectiveCounters.scans_limit}</span>
                )}
              </div>
              
              {/* Dish Explanations Pill */}
              <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                <span className="font-bold">Dish Explanations: </span>
                {isLoadingCounters && user ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span className="font-black">{formatDishExplanationsDisplay()}</span>
                )}
              </div>
              
              {/* Plan Pill - Only show for logged in users */}
              {user && (
                <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                  <span className="font-bold">Plan: </span>
                  <span className="font-black">{getSubscriptionDisplayText(effectiveCounters.subscription_type)}</span>
                </div>
              )}
            </div>

            {/* Right side - Desktop User Section */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:flex items-center space-x-4">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-20 bg-charcoal/20 rounded"></div>
                  </div>
                ) : user ? (
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 transition-colors shadow-[2px_2px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    <div className="text-lg">👤</div>
                    <span>Profile</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="px-4 py-2 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 transition-colors shadow-[2px_2px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Mobile Login/Profile Button */}
              <div className="lg:hidden">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-charcoal/20 rounded"></div>
                  </div>
                ) : user ? (
                  <Link 
                    to="/profile"
                    className="flex items-center px-2 py-1 bg-coral text-white font-bold rounded border-2 border-charcoal text-sm"
                  >
                    <div className="text-sm">👤</div>
                  </Link>
                ) : (
                  <button
                    onClick={handleLoginClick}
                    className="px-3 py-1 bg-coral text-white font-bold rounded border-2 border-charcoal text-sm"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Pills Row - Show for both authenticated and anonymous users */}
          <div className="lg:hidden pb-3">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                <span className="font-bold">Menus: </span>
                {isLoadingCounters && user ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span className="font-black">{effectiveCounters.scans_used}/{effectiveCounters.scans_limit}</span>
                )}
              </div>
              
              <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                <span className="font-bold">Explanations: </span>
                {isLoadingCounters && user ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  <span className="font-black">{formatDishExplanationsDisplay()}</span>
                )}
              </div>
              
              {user && (
                <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                  <span className="font-bold">Plan: </span>
                  <span className="font-black">{getSubscriptionDisplayText(effectiveCounters.subscription_type)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Dropdown (Fixed with proper handlers) */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t-2 border-charcoal bg-cream/90 backdrop-blur-sm">
              <div className="py-4 space-y-2">
                {/* Navigation Links */}
                <button
                  onClick={(e) => {
                    handleLogoClick(e);
                    closeMobileMenu();
                  }}
                  className="block w-full text-left py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                >
                  Home
                </button>
                
                {/* Pricing Link (Fixed) */}
                <button
                  onClick={handlePricingClick}
                  className="block w-full text-left py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                >
                  Pricing
                </button>
                
                {user && (
                  <Link 
                    to="/profile" 
                    onClick={closeMobileMenu}
                    className="block py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                  >
                    Profile
                  </Link>
                )}
                
                <Link 
                  to="/faq" 
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                >
                  FAQ
                </Link>
                
                <Link 
                  to="/contact" 
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                >
                  Contact
                </Link>

                {/* Policies Section */}
                <div className="border-b border-charcoal/10">
                  <div className="py-3 px-4 font-bold text-charcoal">
                    Policies
                  </div>
                  <div className="pl-8 pb-2 space-y-1">
                    <Link 
                      to="/terms" 
                      onClick={closeMobileMenu}
                      className="block py-2 px-4 text-sm font-medium text-charcoal/80 hover:text-coral transition-colors"
                    >
                      Terms of Use
                    </Link>
                    <Link 
                      to="/privacy-policy" 
                      onClick={closeMobileMenu}
                      className="block py-2 px-4 text-sm font-medium text-charcoal/80 hover:text-coral transition-colors"
                    >
                      Privacy Policy
                    </Link>
                    <Link 
                      to="/refund-policy" 
                      onClick={closeMobileMenu}
                      className="block py-2 px-4 text-sm font-medium text-charcoal/80 hover:text-coral transition-colors"
                    >
                      Refund Policy
                    </Link>
                  </div>
                </div>

                {/* Sign In/Out */}
                {user ? (
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left py-3 px-4 font-bold text-coral hover:text-charcoal transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleLoginClick();
                      closeMobileMenu();
                    }}
                    className="block w-full text-left py-3 px-4 font-bold text-coral hover:text-charcoal transition-colors"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer to account for fixed header (Increased z-index to z-50) */}
      <div className="h-20 lg:h-24"></div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default Header;