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

  return (
    <>
      <header className="bg-yellow border-b-4 border-charcoal sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="text-3xl sm:text-4xl font-black text-charcoal group-hover:text-coral transition-colors">
                🍽️
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-charcoal group-hover:text-coral transition-colors">
                  What The Menu?
                </h1>
                <p className="text-xs sm:text-sm font-bold text-charcoal/70 hidden sm:block">
                  AI-powered menu translator
                </p>
              </div>
            </Link>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-charcoal/20 rounded"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  {/* User Stats */}
                  <div className="hidden sm:flex items-center space-x-3 text-sm">
                    <div className="bg-white/50 rounded-full px-3 py-1 border-2 border-charcoal">
                      <span className="font-bold">Scans: </span>
                      <span className="font-black">{userCounters.scans_used}/{userCounters.scans_limit}</span>
                    </div>
                    <div className="bg-white/50 rounded-full px-3 py-1 border-2 border-charcoal">
                      <span className="font-bold">Plan: </span>
                      <span className="font-black capitalize">{userCounters.subscription_type}</span>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="sm:hidden flex items-center space-x-2 text-xs">
                    <div className="bg-white/50 rounded-full px-2 py-1 border border-charcoal">
                      <span className="font-black">{userCounters.scans_used}/{userCounters.scans_limit}</span>
                    </div>
                  </div>

                  {/* Profile Link */}
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 transition-colors shadow-[2px_2px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
                  >
                    <div className="text-lg">👤</div>
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleLoginClick}
                  className="px-4 py-2 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 transition-colors shadow-[2px_2px_0px_#292524] hover:shadow-[4px_4px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
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