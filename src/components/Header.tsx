// src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm relative">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Mobile: Hamburger left, logo centered */}
        <div className="flex items-center w-full md:w-auto justify-between md:justify-start">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 mr-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none"
          >
            <span className="text-3xl font-bold text-wtm-text tracking-tight">
              WhatThe<span className="text-wtm-primary">Menu</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6 ml-auto">
          <Link to="/demos" className="text-gray-700 hover:text-orange-600">
            Demos
          </Link>
          <Link to="/faq" className="text-gray-700 hover:text-orange-600">
            FAQ
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-orange-600">
            Contact
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard/menu-editor"
                className="text-gray-700 hover:text-orange-600"
              >
                Menu Scanner
              </Link>
              <Link
                to="/dashboard/qr-codes"
                className="text-gray-700 hover:text-orange-600"
              >
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

      {/* Mobile Slide-in Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex justify-between items-center border-b">
          <span className="text-xl font-bold text-wtm-text">Menu</span>
          <button className="text-gray-700" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-4">
          <Link
            to="/demos"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-orange-600"
          >
            Demos
          </Link>
          <Link
            to="/faq"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-orange-600"
          >
            FAQ
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsOpen(false)}
            className="text-gray-700 hover:text-orange-600"
          >
            Contact
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard/menu-editor"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-orange-600"
              >
                Menu Scanner
              </Link>
              <Link
                to="/dashboard/qr-codes"
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover:text-orange-600"
              >
                QR Codes
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="text-gray-700 hover:text-orange-600 text-left"
              >
                Sign Out
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Dark overlay when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
