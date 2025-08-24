import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Utensils } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { User } from '@supabase/supabase-js';
import LoginModal from './LoginModal';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleDemoClick = () => {
    navigate('/consumers');
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    navigate('/restaurants');
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowLoginModal(true);
    }
    setIsOpen(false);
  };

  const isRestaurantPage = location.pathname.startsWith('/restaurants');
  const isConsumerPage = location.pathname === '/consumers';

  return (
    <>
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Utensils className="h-8 w-8 text-coral-500" />
              <span className="text-2xl font-black text-gray-900">
                WhatTheMenu<span className="text-coral-500">?</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                to="/restaurants"
                className={`font-semibold transition-colors hover:text-coral-500 ${
                  isRestaurantPage ? 'text-coral-500' : 'text-gray-700'
                }`}
              >
                For Restaurants
              </Link>
              
              <button
                onClick={handleDemoClick}
                className="font-semibold text-gray-700 hover:text-coral-500 transition-colors"
              >
                See Demo
              </button>
              
              <Link
                to="/contact"
                className="font-semibold text-gray-700 hover:text-coral-500 transition-colors"
              >
                Contact
              </Link>
              
              <Link
                to="/faq"
                className="font-semibold text-gray-700 hover:text-coral-500 transition-colors"
              >
                FAQ
              </Link>

              {/* Consumer Demo Access (when on consumer page) */}
              {isConsumerPage && (
                <button
                  onClick={handleProfileClick}
                  className="font-semibold text-gray-700 hover:text-coral-500 transition-colors"
                >
                  {user ? 'Profile' : 'Login'}
                </button>
              )}

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                className="bg-coral-500 hover:bg-coral-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-coral-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-inset"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/restaurants"
                className={`block px-3 py-2 rounded-md text-base font-semibold transition-colors ${
                  isRestaurantPage 
                    ? 'text-coral-500 bg-coral-50' 
                    : 'text-gray-700 hover:text-coral-500 hover:bg-gray-50'
                }`}
                onClick={() => setIsOpen(false)}
              >
                For Restaurants
              </Link>
              
              <button
                onClick={handleDemoClick}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-coral-500 hover:bg-gray-50 transition-colors"
              >
                See Demo
              </button>
              
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-coral-500 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              
              <Link
                to="/faq"
                className="block px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-coral-500 hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>

              {/* Consumer Demo Access (when on consumer page) */}
              {isConsumerPage && (
                <button
                  onClick={handleProfileClick}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-semibold text-gray-700 hover:text-coral-500 hover:bg-gray-50 transition-colors"
                >
                  {user ? 'Profile' : 'Login'}
                </button>
              )}

              {/* Mobile CTA */}
              <div className="px-3 py-2">
                <button
                  onClick={handleGetStarted}
                  className="w-full bg-coral-500 hover:bg-coral-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-md"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default Header;