// Fixed Header component - Replace your existing Header component

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';
import { getOrCreateEnhancedUserProfile, getEnhancedUsageSummary, EnhancedUserProfile } from '../services/enhancedUsageTracking';
import { getAnonymousLimits } from '../services/anonymousUsageTracking';
import { getGlobalCounters, subscribeToCounters, GlobalCounters } from '../services/counterService';
import { UsageSummary } from '../types';

interface HeaderProps {
  // Optional props for triggering counter updates
  onCounterUpdate?: number;
}

const Header: React.FC<HeaderProps> = ({ onCounterUpdate }) => {
  const { user, signOut } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userProfile, setUserProfile] = useState<EnhancedUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalCounters, setGlobalCounters] = useState<GlobalCounters>({
    menus_scanned: 1337,
    dish_explanations: 0
  });
  const [usage, setUsage] = useState<UsageSummary>({
    scansUsed: 0,
    scansLimit: 5,
    explanationsUsed: 0,
    explanationsLimit: 25,
    hasUnlimited: false,
    canScan: true,
    timeRemaining: null
  });

  // Load global counters and subscribe to changes
  useEffect(() => {
    const loadCounters = async () => {
      try {
        const counters = await getGlobalCounters();
        setGlobalCounters(counters);
        console.log('Header: Loaded global counters:', counters);
      } catch (error) {
        console.error('Error loading global counters in header:', error);
      }
    };

    loadCounters();

    // Subscribe to real-time updates
    const subscription = subscribeToCounters((newCounters) => {
      console.log('Header: Received counter update:', newCounters);
      setGlobalCounters(newCounters);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Force refresh counters when onCounterUpdate changes
  useEffect(() => {
    if (onCounterUpdate > 0) {
      const refreshCounters = async () => {
        try {
          const counters = await getGlobalCounters();
          setGlobalCounters(counters);
          console.log('Header: Force refreshed counters:', counters);
        } catch (error) {
          console.error('Error force refreshing counters:', error);
        }
      };
      refreshCounters();
    }
  }, [onCounterUpdate]);

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

  // Update usage when user changes
  useEffect(() => {
    updateUsageData();
  }, [user]);

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

            {/* Desktop Counters (hidden on mobile) - NOW USING GLOBAL COUNTERS */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Global Menus Scanned Counter */}
              <div className="px-4 py-2 rounded-full border-2 text-sm font-medium select-none bg-green-50 text-green-700 border-green-300">
                Global Menus: {globalCounters.menus_scanned.toLocaleString()}
              </div>

              {/* Global Dishes Explained Counter */}
              <div className="px-4 py-2 rounded-full border-2 text-sm font-medium select-none bg-blue-50 text-blue-700 border-blue-300">
                Global Dishes: {globalCounters.dish_explanations.toLocaleString()}
              </div>

              {/* User Personal Counters */}
              <div className={`px-4 py-2 rounded-full border-2 text-sm font-medium select-none ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700 border-green-300' : 
                usage.scansUsed >= (usage.scansLimit as number) ? 'bg-red-50 text-red-700 border-red-300' : 
                usage.scansUsed >= (usage.scansLimit as number) * 0.8 ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                'bg-gray-50 text-gray-700 border-gray-300'
              }`}>
                Your Scans: {usage.scansUsed}/{usage.scansLimit}
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
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
                Global: {globalCounters.menus_scanned.toLocaleString()}
              </div>
              
              <div className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-medium">
                Dishes: {globalCounters.dish_explanations.toLocaleString()}
              </div>
              
              <div className={`px-2 py-1 rounded-full font-medium ${
                usage.hasUnlimited ? 'bg-green-50 text-green-700' : 
                usage.scansUsed >= (usage.scansLimit as number) ? 'bg-red-50 text-red-700' : 
                'bg-gray-50 text-gray-700'
              }`}>
                Your: {usage.scansUsed}/{usage.scansLimit}
              </div>

              {usage.hasUnlimited && usage.timeRemaining && (
                <div className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
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