import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getUserCounters, UserCounters } from '../services/counterService';

interface HeaderProps {
  onCounterUpdate?: number; // Trigger to refresh counters
}

const Header: React.FC<HeaderProps> = ({ onCounterUpdate }) => {
  const { user, loading } = useAuth();
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

  return (
    <>
      <header className="bg-cream border-b-4 border-charcoal sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
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
                    <span className="font-black capitalize">{userCounters.subscription_type}</span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile & Tablet - Hamburger Menu and User Section */}
            <div className="flex items-center space-x-4">
              {/* User Section for Desktop */}
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
                    Sign In
                  </button>
                )}
              </div>

              {/* Hamburger Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
                aria-label="Toggle menu"
              >
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-6 h-0.5 bg-charcoal transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t-2 border-charcoal bg-cream">
              <div className="py-4 space-y-4">
                {/* User Stats for Mobile */}
                {!loading && (
                  <>
                    <div className="space-y-2">
                      <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal text-center">
                        <span className="font-bold">Menus scanned: </span>
                        <span className="font-black">{userCounters.scans_used}/{userCounters.scans_limit}</span>
                      </div>
                      
                      <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal text-center">
                        <span className="font-bold">Dish Explanations: </span>
                        <span className="font-black">{userCounters.current_menu_dish_explanations}/5</span>
                      </div>
                      
                      {user && (
                        <div className="bg-white/50 rounded-full px-4 py-2 border-2 border-charcoal text-center">
                          <span className="font-bold">Plan: </span>
                          <span className="font-black capitalize">{userCounters.subscription_type}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="border-t border-charcoal/20 pt-4"></div>
                  </>
                )}

                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link 
                    to="/" 
                    onClick={closeMobileMenu}
                    className="block py-2 px-4 font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Home
                  </Link>
                  
                  {user ? (
                    <>
                      <Link 
                        to="/profile" 
                        onClick={closeMobileMenu}
                        className="block py-2 px-4 font-bold text-charcoal hover:text-coral transition-colors"
                      >
                        👤 Profile
                      </Link>
                      <button
                        onClick={() => {
                          // Add sign out functionality here
                          closeMobileMenu();
                        }}
                        className="block w-full text-left py-2 px-4 font-bold text-charcoal hover:text-coral transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        handleLoginClick();
                        closeMobileMenu();
                      }}
                      className="block w-full text-left py-2 px-4 font-bold text-coral hover:text-charcoal transition-colors"
                    >
                      Sign In
                    </button>
                  )}
                  
                  <Link 
                    to="/contact" 
                    onClick={closeMobileMenu}
                    className="block py-2 px-4 font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    Contact
                  </Link>
                  
                  <Link 
                    to="/faq" 
                    onClick={closeMobileMenu}
                    className="block py-2 px-4 font-bold text-charcoal hover:text-coral transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
};

export default Header;