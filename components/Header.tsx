// Enhanced Header component - Replace your existing Header component

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getOrCreateEnhancedUserProfile, getEnhancedUsageSummary, EnhancedUserProfile } from '../services/enhancedUsageTracking';
import { getAnonymousLimits } from '../services/anonymousUsageTracking';
import { UsageSummary } from '../types';

interface HeaderProps {
  // Optional props for triggering counter updates
  onCounterUpdate?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCounterUpdate }) => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<UsageSummary>({
    scansUsed: 0,
    scansLimit: 5,
    explanationsUsed: 0,
    explanationsLimit: 25,
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
          
          {/* First Line: Logo + Desktop Counters + Auth Buttons */}
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* Logo + Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl lg:text-3xl font-black text-charcoal tracking-tighter">
                WhatTheMenu?
              </Link>
              <nav className="hidden md:flex space-x-6">
                <NavLink to="/faq" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>FAQ</NavLink>
                <NavLink to="/contact" className={({ isActive }) => `text-lg font-bold ${isActive ? 'text-coral' : 'text-charcoal/70 hover:text-charcoal'}`}>Contact</NavLink>
              </nav>
            </div>

            {/* Desktop Counters (hidden on mobile) */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Menus Scanned Counter */}
              <div className={`px-4 py-2 rounded-full border-2 text-sm font-medium select-none ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700 border-green-300' : 
                usage.scansUsed >= (usage.scansLimit as number) ? 'bg-red-50 text-red-700 border-red-300' : 
                usage.scansUsed >= (usage.scansLimit as number) * 0.8 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                'bg-gray-50 text-gray-700 border-gray-300'
              }`}>
                Menus Scanned: {usage.scansUsed}/{usage.scansLimit}
              </div>

              {/* Dishes Explained Counter */}
              <div className={`px-4 py-2 rounded-full border-2 text-sm font-medium select-none ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700 border-green-300' : 
                usage.explanationsUsed >= (usage.explanationsLimit as number) ? 'bg-red-50 text-red-700 border-red-300' : 
                usage.explanationsUsed >= (usage.explanationsLimit as number) * 0.8 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                'bg-gray-50 text-gray-700 border-gray-300'
              }`}>
                Dishes Explained: {usage.explanationsUsed}/{usage.explanationsLimit}
              </div>

              {/* Time Remaining for Unlimited Users */}
              {usage.hasUnlimited && usage.timeRemaining && (
                <div className="px-4 py-2 rounded-full border-2 border-green-300 bg-green-50 text-green-700 text-sm font-medium select-none">
                  Expires in {formatTimeRemaining(usage.timeRemaining)}
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
            <div className="flex items-center justify-center gap-6">
              <div className={`px-3 py-1 rounded-full text-xs font-medium select-none ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700' : 
                usage.scansUsed >= (usage.scansLimit as number) ? 'bg-red-50 text-red-700' : 
                'bg-gray-50 text-gray-700'
              }`}>
                Menus: {usage.scansUsed}/{usage.scansLimit}
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium select-none ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700' : 
                usage.explanationsUsed >= (usage.explanationsLimit as number) ? 'bg-red-50 text-red-700' : 
                'bg-gray-50 text-gray-700'
              }`}>
                Dishes: {usage.explanationsUsed}/{usage.explanationsLimit}
              </div>

              {usage.hasUnlimited && usage.timeRemaining && (
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium select-none">
                  {formatTimeRemaining(usage.timeRemaining)}
                </div>
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