// Fixed Header component with hamburger menu

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getOrCreateEnhancedUserProfile, getEnhancedUsageSummary, EnhancedUserProfile } from '../services/enhancedUsageTracking';
import { getAnonymousLimits } from '../services/anonymousUsageTracking';
import { UsageSummary } from '../types';

const scrollToPricing = () => {
  const pricingSection = document.querySelector('#pricing-section');
  if (pricingSection) {
    pricingSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Fallback: scroll to bottom where pricing usually is
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
};

// Hamburger Menu Component
const HamburgerMenu: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();

  const handlePricingClick = () => {
    onToggle(); // Close menu
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, then scroll
      setTimeout(() => {
        scrollToPricing();
      }, 100);
    } else {
      scrollToPricing();
    }
  };

  const handleLinkClick = () => {
    onToggle(); // Close menu when link is clicked
    window.scrollTo(0, 0); // Scroll to top
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1"
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-charcoal/50" onClick={onToggle}>
          <div 
            className="fixed top-0 left-0 h-full w-80 bg-cream border-r-4 border-charcoal shadow-[8px_0px_16px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={onToggle}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-charcoal hover:text-coral"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Menu Title */}
              <h2 className="text-2xl font-black text-charcoal mb-8 mt-4">Menu</h2>

              {/* Menu Items */}
              <nav className="space-y-4">
                <button
                  onClick={handlePricingClick}
                  className="block w-full text-left text-lg font-bold text-charcoal hover:text-coral transition-colors py-2"
                >
                  Pricing
                </button>
                
                <NavLink
                  to="/faq"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `block text-lg font-bold py-2 transition-colors ${
                    isActive ? 'text-coral' : 'text-charcoal hover:text-coral'
                  }`}
                >
                  FAQ
                </NavLink>
                
                <NavLink
                  to="/terms"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `block text-lg font-bold py-2 transition-colors ${
                    isActive ? 'text-coral' : 'text-charcoal hover:text-coral'
                  }`}
                >
                  Terms of Use
                </NavLink>
                
                <NavLink
                  to="/privacy-policy"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `block text-lg font-bold py-2 transition-colors ${
                    isActive ? 'text-coral' : 'text-charcoal hover:text-coral'
                  }`}
                >
                  Privacy Policy
                </NavLink>
                
                <NavLink
                  to="/refund-policy"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `block text-lg font-bold py-2 transition-colors ${
                    isActive ? 'text-coral' : 'text-charcoal hover:text-coral'
                  }`}
                >
                  Refund Policy
                </NavLink>
                
                <NavLink
                  to="/contact"
                  onClick={handleLinkClick}
                  className={({ isActive }) => `block text-lg font-bold py-2 transition-colors ${
                    isActive ? 'text-coral' : 'text-charcoal hover:text-coral'
                  }`}
                >
                  Contact
                </NavLink>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface HeaderProps {
  // Optional props for triggering counter updates
  onCounterUpdate?: number;
}

const Header: React.FC<HeaderProps> = ({ onCounterUpdate }) => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageSummary>({
    scansUsed: 0,
    scansLimit: 5,
    explanationsUsed: 0,
    explanationsLimit: 5,
    hasUnlimited: false,
    canScan: true,
    timeRemaining: null
  });

  // Fetch user profile and calculate usage
  const updateUsageData = async () => {
    if (user) {
      setLoading(true);
      try {
        const profile = await getOrCreateEnhancedUserProfile(user.id, user.email || undefined);
        setUserProfile(profile);
        const usageSummary = getEnhancedUsageSummary(profile);
        setUsage(usageSummary);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // Anonymous user
      setUserProfile(null);
      const anonymousUsage = getAnonymousLimits();
      setUsage(anonymousUsage);
    }
  };

  // Update usage when user changes or when counter update is triggered
  useEffect(() => {
    updateUsageData();
  }, [user, onCounterUpdate]);

  // Close mobile menu when clicking outside or on navigation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Format time remaining for unlimited users
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <>
      <header className="bg-cream/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b-4 border-charcoal">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* First Line: Hamburger + Logo + Desktop Nav + Desktop Counters + Auth Buttons */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Left Section: Hamburger + Logo + Desktop Nav */}
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu - Mobile Only */}
              <HamburgerMenu 
                isOpen={showMobileMenu} 
                onToggle={() => setShowMobileMenu(!showMobileMenu)} 
              />
              
              {/* Logo */}
              <Link to="/" className="text-2xl lg:text-3xl font-black text-charcoal tracking-tighter">
                WhatTheMenu?
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6 ml-8">
                <NavLink to="/faq" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>FAQ</NavLink>
                <NavLink to="/contact" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>Contact</NavLink>
              </nav>
            </div>

            {/* Desktop Counters - Centered between logo and auth */}
            <div className="hidden lg:flex items-center gap-4">
              {usage.hasUnlimited ? (
                // Unlimited users - single green pill
                <div className="px-4 py-2 rounded-full border-2 text-sm font-medium select-none bg-green-50 text-green-700 border-green-300">
                  Unlimited scans. Enjoy your meal
                  {usage.timeRemaining && (
                    <span className="ml-2 text-xs opacity-75">
                      (expires in {formatTimeRemaining(usage.timeRemaining)})
                    </span>
                  )}
                </div>
              ) : usage.scansUsed >= (usage.scansLimit as number) ? (
                // Limit reached - upgrade pill
                <button 
                  onClick={scrollToPricing}
                  className="px-4 py-2 rounded-full border-2 text-sm font-medium bg-green-50 text-green-700 border-green-300 hover:bg-green-100 transition-colors cursor-pointer"
                >
                  Purchase one of our plans to continue scanning
                </button>
              ) : (
                // Normal usage - two grey pills with "Free User Limits" label
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-charcoal/70">Free User Limits</span>
                  <div className="px-4 py-2 rounded-full border-2 text-sm font-medium select-none bg-gray-50 text-gray-700 border-gray-300">
                    Menus Scanned: {usage.scansUsed}/{usage.scansLimit}
                  </div>
                  <div className="px-4 py-2 rounded-full border-2 text-sm font-medium select-none bg-gray-50 text-gray-700 border-gray-300">
                    Dish Explanations: {usage.explanationsUsed}/{usage.explanationsLimit}
                  </div>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline text-sm font-bold text-charcoal/70">
                    {userProfile ? `Welcome, ${user.email?.split('@')[0]}` : 'Loading...'}
                  </span>
                  <button 
                    onClick={signOut}
                    className="px-3 py-2 text-sm lg:text-lg font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="hidden sm:inline-block px-3 py-2 text-sm lg:text-lg font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowLoginModal(true)}
                    className="px-3 py-2 text-sm lg:text-lg font-bold text-white bg-coral rounded-full border-2 lg:border-4 border-charcoal shadow-[2px_2px_0px_#292524] lg:shadow-[4px_4px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] lg:hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Second Line: Mobile Counters (only visible on mobile) */}
          <div className="lg:hidden border-t border-charcoal/20 py-2">
            <div className="flex flex-col items-center gap-2 text-xs">
              {usage.hasUnlimited ? (
                // Unlimited users - single green pill
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                  Unlimited scans. Enjoy your meal
                </div>
              ) : usage.scansUsed >= (usage.scansLimit as number) ? (
                // Limit reached - upgrade pill
                <button 
                  onClick={scrollToPricing}
                  className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium text-center hover:bg-green-100 transition-colors cursor-pointer"
                >
                  Purchase one of our plans to continue scanning
                </button>
              ) : (
                // Normal usage - label + two grey pills
                <>
                  <span className="text-xs font-bold text-charcoal/70">Free User Limits</span>
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 font-medium">
                      Menus: {usage.scansUsed}/{usage.scansLimit}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-gray-50 text-gray-700 font-medium">
                      Dishes: {usage.explanationsUsed}/{usage.explanationsLimit}
                    </div>
                  </div>
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

export default Header;