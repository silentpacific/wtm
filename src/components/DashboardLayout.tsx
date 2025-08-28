// src/components/DashboardLayout.tsx - Updated for new auth structure
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Edit,
  QrCode,
  User,
  CreditCard,
  LogOut,
  Building
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { signOut, restaurant } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Menu Editor',
      href: '/dashboard/menu-editor',
      icon: Edit,
      current: location.pathname === '/dashboard/menu-editor'
    },
    {
      name: 'QR Codes',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      current: location.pathname === '/dashboard/qr-codes'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      current: location.pathname === '/dashboard/profile'
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCard,
      current: location.pathname === '/dashboard/billing'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                WhatThe<span className="text-orange-500">Menu</span>
              </span>
            </Link>
          </div>

          {/* Restaurant Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mr-3">
                <Building className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {restaurant?.restaurant_name || 'Restaurant Name'}
                </h2>
                <p className="text-xs text-gray-500">
                  {restaurant?.cuisine_type || 'Cuisine Type'}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        item.current
                          ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="px-4 pb-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;