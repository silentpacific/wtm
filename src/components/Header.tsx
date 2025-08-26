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
    <header style={{ backgroundColor: 'var(--wtm-surface)' }} 
            className="shadow-sm border-b" 
            style-border-color="var(--wtm-bg)">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
              WhatThe<span style={{ color: 'var(--wtm-primary)' }}>Menu</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/demos"
              className={`font-semibold transition-colors ${
                isActive('/demos') 
                  ? '' 
                  : ''
              }`}
              style={{ 
                color: isActive('/demos') 
                  ? 'var(--wtm-primary)' 
                  : 'var(--wtm-muted)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--wtm-primary)'}
              onMouseLeave={(e) => {
                if (!isActive('/demos')) {
                  e.target.style.color = 'var(--wtm-muted)';
                }
              }}
            >
              Demo Menus
            </Link>
            
            <Link
              to="/contact"
              className="font-semibold transition-colors"
              style={{ 
                color: isActive('/contact') 
                  ? 'var(--wtm-primary)' 
                  : 'var(--wtm-muted)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--wtm-primary)'}
              onMouseLeave={(e) => {
                if (!isActive('/contact')) {
                  e.target.style.color = 'var(--wtm-muted)';
                }
              }}
            >
              Contact
            </Link>
            
            <Link
              to="/faq"
              className="font-semibold transition-colors"
              style={{ 
                color: isActive('/faq') 
                  ? 'var(--wtm-primary)' 
                  : 'var(--wtm-muted)'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--wtm-primary)'}
              onMouseLeave={(e) => {
                if (!isActive('/faq')) {
                  e.target.style.color = 'var(--wtm-muted)';
                }
              }}
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
                    className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: isProfileMenuOpen ? 'var(--wtm-bg)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isProfileMenuOpen) {
                        e.target.style.backgroundColor = 'var(--wtm-bg)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProfileMenuOpen) {
                        e.target.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                         style={{ backgroundColor: '#FCEDEA' }}>
                      <span className="font-semibold text-sm" style={{ color: 'var(--wtm-primary)' }}>
                        {restaurant?.owner_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block font-medium" style={{ color: 'var(--wtm-text)' }}>
                      {restaurant?.owner_name || user.email}
                    </span>
                  </button>

                  {/* Profile dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50 card">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--wtm-text)' }}
                        onClick={() => setIsProfileMenuOpen(false)}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--wtm-bg)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <User size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <div className="border-t my-1" style={{ borderColor: '#EFE7E2' }} />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full text-left px-4 py-2 text-sm transition-colors"
                        style={{ color: '#B91C1C' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                    className="font-semibold transition-colors"
                    style={{ 
                      color: isActive('/login') 
                        ? 'var(--wtm-primary)' 
                        : 'var(--wtm-muted)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--wtm-primary)'}
                    onMouseLeave={(e) => {
                      if (!isActive('/login')) {
                        e.target.style.color = 'var(--wtm-muted)';
                      }
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--wtm-muted)' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--wtm-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--wtm-muted)'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: '#EFE7E2' }}>
            <div className="flex flex-col space-y-4">
              <Link
                to="/demos"
                onClick={() => setIsMenuOpen(false)}
                className="font-semibold py-2"
                style={{ 
                  color: isActive('/demos') 
                    ? 'var(--wtm-primary)' 
                    : 'var(--wtm-muted)'
                }}
              >
                Demo Menus
              </Link>
              
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="font-semibold py-2"
                style={{ 
                  color: isActive('/contact') 
                    ? 'var(--wtm-primary)' 
                    : 'var(--wtm-muted)'
                }}
              >
                Contact
              </Link>
              
              <Link
                to="/faq"
                onClick={() => setIsMenuOpen(false)}
                className="font-semibold py-2"
                style={{ 
                  color: isActive('/faq') 
                    ? 'var(--wtm-primary)' 
                    : 'var(--wtm-muted)'
                }}
              >
                FAQ
              </Link>

              <div className="pt-2 border-t space-y-2" style={{ borderColor: '#EFE7E2' }}>
                {user ? (
                  // Logged in mobile menu
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block font-semibold py-2"
                      style={{ color: 'var(--wtm-muted)' }}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left font-semibold py-2"
                      style={{ color: '#B91C1C' }}
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
                      className="block font-semibold py-2"
                      style={{ color: 'var(--wtm-muted)' }}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="btn btn-primary block text-center"
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