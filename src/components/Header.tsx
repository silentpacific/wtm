// src/components/Header.tsx - Navigation with auth state awareness
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, restaurant, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              WhatThe<span className="text-coral-600">Menu?</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/demos"
              className={`font-semibold transition-colors ${
                isActive('/demos') 
                  ? 'text-coral-600' 
                  : 'text-gray-600 hover:text-coral-600'
              }`}
            >
              Demo Menus
            </Link>
            
            <Link
              to="/contact"
              className={`font-semibold transition-colors ${
                isActive('/contact') 
                  ? 'text-coral-600' 
                  : 'text-gray-600 hover:text-coral-600'
              }`}
            >
              Contact
            </Link>
            
            <Link
              to="/faq"
              className={`font-semibold transition-colors ${
                isActive('/faq') 
                  ? 'text-coral-600' 
                  : 'text-gray-600 hover:text-coral-600'
              }`}
            >
              FAQ
            </Link>
            
            {/* Auth buttons or Profile */}
            <div className="flex items-center space-x-3">
              {user ? (
                // Logged in - show profile menu
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center">
                      <span className="text-coral-600 font-semibold text-sm">
                        {restaurant?.owner_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium text-gray-700">
                      {restaurant?.owner_name || user.email}
                    </span>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <div className="border-t my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Not logged in - show auth buttons
                <>
                  <Link
                    to="/login"
                    className={`font-semibold transition-colors ${
                      isActive('/login') 
                        ? 'text-coral-600' 
                        : 'text-gray-600 hover:text-coral-600'
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-coral-600 hover:bg-coral-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-coral-600"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link
                to="/demos"
                onClick={() => setIsMenuOpen(false)}
                className={`font-semibold py-2 ${
                  isActive('/demos') 
                    ? 'text-coral-600' 
                    : 'text-gray-600'
                }`}
              >
                Demo Menus
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`font-semibold py-2 ${
                  isActive('/contact') 
                    ? 'text-coral-600' 
                    : 'text-gray-600'
                }`}
              >
                Contact
              </Link>
              
              <Link
                to="/faq"
                onClick={() => setIsMenuOpen(false)}
                className={`font-semibold py-2 ${
                  isActive('/faq') 
                    ? 'text-coral-600' 
                    : 'text-gray-600'
                }`}
              >
                FAQ
              </Link>

              <div className="pt-2 border-t space-y-2">
                {user ? (
                  // Logged in mobile menu
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-gray-600 font-semibold py-2"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left text-red-600 font-semibold py-2"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Not logged in mobile menu
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-gray-600 font-semibold py-2"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block bg-coral-600 hover:bg-coral-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menus */}
      {(isProfileMenuOpen || isMenuOpen) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setIsProfileMenuOpen(false);
            setIsMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;