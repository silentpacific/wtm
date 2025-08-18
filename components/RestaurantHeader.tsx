import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell, Settings } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

export default function RestaurantHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const { restaurant, logout } = useRestaurantAuth();

  const navigation = [
    { name: 'Dashboard', href: '/restaurant/dashboard', icon: '📊' },
    { name: 'Menu', href: '/restaurant/menu', icon: '🍽️' },
    { name: 'QR Codes', href: '/restaurant/qr-codes', icon: '📱' },
    { name: 'Profile', href: '/restaurant/profile', icon: '🏪' },
    { name: 'Billing', href: '/restaurant/billing', icon: '💳' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await logout();
      setProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!restaurant) {
    return null; // Don't render header if no restaurant loaded
  }

  return (
    <header className="bg-white shadow-sm border-b-2 border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/restaurant/dashboard" className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">WTM</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WhatTheMenu</h1>
                <p className="text-xs text-gray-500">Restaurant Dashboard</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side - Notifications & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Subscription Status Badge */}
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              restaurant.subscription_status === 'active' 
                ? 'bg-green-100 text-green-800'
                : restaurant.subscription_status === 'trial'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {restaurant.subscription_status === 'active' && '✓ Active'}
              {restaurant.subscription_status === 'trial' && '⏱️ Trial'}
              {restaurant.subscription_status === 'cancelled' && '⚠️ Cancelled'}
            </div>

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              {/* Notification dot */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="ml-2 text-gray-700 font-medium">{restaurant.business_name}</span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {restaurant.contact_email}
                    </div>
                    <Link
                      to="/restaurant/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings size={16} className="inline mr-2" />
                      Restaurant Settings
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={handleSignOut}
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Profile Section */}
            <div className="border-t border-gray-300 pt-4 mt-4">
              <div className="flex items-center px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-base font-medium text-gray-800">{restaurant.business_name}</div>
                  <div className="text-sm text-gray-500">{restaurant.contact_email}</div>
                </div>
              </div>
              <Link
                to="/restaurant/profile"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings size={16} className="inline mr-2" />
                Restaurant Settings
              </Link>
              <button
                className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-100"
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} className="inline mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}