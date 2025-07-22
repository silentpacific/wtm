import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getUserCounters, UserCounters } from '../services/counterService';

interface HeaderProps {
  onCounterUpdate?: number; // Trigger to refresh counters
}

const Header: React.FC<HeaderProps> = ({ onCounterUpdate }) => {
  const { user, loading, signOut } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userCounters, setUserCounters] = useState<UserCounters>({
    scans_used: 0,
    scans_limit: 5,
    current_menu_dish_explanations: 0,
    subscription_type: 'free'
  });

  // Load user counters when user changes or when triggered
  useEffect(() => {
    const loadUserCounters = async () => {
      if (user) {
        try {
          const counters = await getUserCounters(user.id);
          setUserCounters(counters);
        } catch (error) {
          console.error('Error loading user counters:', error);
        }
      }
    };

    if (user) {
      loadUserCounters();
    }
  }, [user, onCounterUpdate]);

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

  return (
    <>
      <header className="bg-cream/80 backdrop-blur-sm border-b-4 border-charcoal fixed top-0 left-0 right-0 z-40">
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

            {/* Center - Logo */}
            <Link to="/" className="flex items-center group flex-1 lg:flex-none justify-center lg:justify-start">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-charcoal group-hover:text-coral transition-colors">
                WhatTheMenu?
              </h1>
            </Link>

            {/* Desktop Pills - Only show on desktop */}
            {!loading && (
              <div className="hidden lg:flex items-center space-x-4">
                {/* Menus Scanned Pill */}
                <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                  <span className="font-bold">Menus scanned: </span>
                  <span className="font-black">{userCounters.scans_used}/{userCounters.scans_limit}</span>
                </div>
                
                {/* Dish Explanations Pill */}
                <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                  <span className="font-bold">Dish Explanations: </span>
                  <span className="font-black">{userCounters.current_menu_dish_explanations}/5</span>
                </div>
                
                {/* Plan Pill - Only show for logged in users */}
                {user && (
                  <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal">
                    <span className="font-bold">Plan: </span>
                    <span className="font-black">{getSubscriptionDisplayText(userCounters.subscription_type)}</span>
                  </div>
                )}
              </div>
            )}

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

          {/* Mobile Pills Row - Only show on mobile when not loading */}
          {!loading && (
            <div className="lg:hidden pb-3">
              <div className="flex flex-wrap justify-center gap-2 text-xs">
                <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                  <span className="font-bold">Menus: </span>
                  <span className="font-black">{userCounters.scans_used}/{userCounters.scans_limit}</span>
                </div>
                
                <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                  <span className="font-bold">Explanations: </span>
                  <span className="font-black">{userCounters.current_menu_dish_explanations}/5</span>
                </div>
                
                {user && (
                  <div className="bg-white/50 rounded-full px-3 py-1 border border-charcoal">
                    <span className="font-bold">Plan: </span>
                    <span className="font-black">{getSubscriptionDisplayText(userCounters.subscription_type)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t-2 border-charcoal bg-cream/90 backdrop-blur-sm">
              <div className="py-4 space-y-2">
                {/* Navigation Links */}
                <Link 
                  to="/" 
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 font-bold text-charcoal hover:text-coral transition-colors border-b border-charcoal/10"
                >
                  Home
                </Link>
                
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

      {/* Spacer to account for fixed header */}
      <div className="h-20 lg:h-24"></div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default Header;