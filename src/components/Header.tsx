// src/components/Header.tsx - Updated for new auth structure
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
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              WhatThe<span className="text-orange-500">Menu</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-12">
            <Link
              to="/demos"
              className={`font-medium text-lg transition-colors hover:text-orange-500 ${
                isActive('/demos') ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              Demo Menus
            </Link>
            
            <Link
              to="/contact"
              className={`font-medium text-lg transition-colors hover:text-orange-500 ${
                isActive('/contact') ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              Contact
            </Link>
            
            <Link
              to="/faq"
              className={`font-medium text-lg transition-colors hover:text-orange-500 ${
                isActive('/faq') ? 'text-orange-500' : 'text-gray-600'
              }`}
            >
              FAQ
            </Link>
            
            {/* Auth buttons or Profile */}
            <div className="flex items-center space-x-6">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-3 p-3 rounded-2xl transition-colors hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="font-semibold text-orange-600">
                        {restaurant?.owner_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium text-gray-900">
                      {restaurant?.owner_name || user.email}
                    </span>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {restaurant?.restaurant_name || 'Restaurant'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User size={18} className="mr-3" />
                        Dashboard
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`font-medium text-lg transition-colors hover:text-orange-500 ${
                      isActive('/login') ? 'text-orange-500' : 'text-gray-600'
                    }`}
                  >
                    Login
                  </Link>
                  {/*<Link
                    to="/signup"
                    className="bg-orange-500 text-white font-semibold px-8 py-3 rounded-2xl hover:bg-orange-600 hover:scale-[1.02] transition-all duration-200 shadow-md"
                  >
                    Start Free Trial
			  </Link> */}
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100">
            <div className="flex flex-col space-y-6">
              <Link
                to="/demos"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium text-lg py-2 transition-colors hover:text-orange-500 ${
                  isActive('/demos') ? 'text-orange-500' : 'text-gray-600'
                }`}
              >
                Demo Menus
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium text-lg py-2 transition-colors hover:text-orange-500 ${
                  isActive('/contact') ? 'text-orange-500' : 'text-gray-600'
                }`}
              >
                Contact
              </Link>
              
              <Link
                to="/faq"
                onClick={() => setIsMenuOpen(false)}
                className={`font-medium text-lg py-2 transition-colors hover:text-orange-500 ${
                  isActive('/faq') ? 'text-orange-500' : 'text-gray-600'
                }`}
              >
                FAQ
              </Link>

              <div className="pt-4 border-t border-gray-100 space-y-4">
                {user ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-900">
                        {restaurant?.restaurant_name || 'Restaurant'}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block font-medium text-lg py-2 text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left font-medium text-lg py-2 text-red-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block font-medium text-lg py-2 text-gray-600 hover:text-orange-500 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="block bg-orange-500 text-white font-semibold px-8 py-4 rounded-2xl text-center hover:bg-orange-600 transition-colors"
                    >
                      Start Free Trial
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;