// src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <span className="text-3xl font-bold text-wtm-text tracking-tight">
              WhatThe<span className="text-wtm-primary">Menu</span>
            </span>
          </Link>

        <nav className="flex items-center space-x-6">
          {/* Always visible */}
          <Link to="/demos" className="text-gray-700 hover:text-orange-600">
            Demos
          </Link>
          <Link to="/faq" className="text-gray-700 hover:text-orange-600">
            FAQ
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-orange-600">
            Contact
          </Link>

          {/* Only when logged in */}
          {user && (
            <>
              <Link to="/dashboard/menu-editor" className="text-gray-700 hover:text-orange-600">
                Menu Scanner
              </Link>
              <Link to="//dashboard/qr-codes" className="text-gray-700 hover:text-orange-600">
                QR Codes
              </Link>
              <button
                onClick={signOut}
                className="text-gray-700 hover:text-orange-600"
              >
                Sign Out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
