import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Menu as MenuIcon, 
  User, 
  CreditCard, 
  QrCode, 
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

interface RestaurantLayoutProps {
  children: React.ReactNode;
}

export default function RestaurantLayout({ children }: RestaurantLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { restaurant, logout } = useRestaurantAuth();

  const navigation = [
    { name: 'Dashboard', href: '/restaurant/dashboard', icon: BarChart3 },
    { name: 'Menu Manager', href: '/restaurant/menu', icon: MenuIcon },
    { name: 'Profile', href: '/restaurant/profile', icon: User },
    { name: 'QR Codes', href: '/restaurant/qr-codes', icon: QrCode },
    { name: 'Billing', href: '/restaurant/billing', icon: CreditCard },
  ];

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  const getSubscriptionBadge = () => {
    if (!restaurant) return null;
    
    switch (restaurant.subscription_status) {
      case 'trial':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Trial</span>;
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/restaurant/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">WhatTheMenu</span>
            <span className="ml-2 text-sm text-gray-500">Restaurant</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        {/* Restaurant info */}
        {restaurant && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {restaurant.business_name}
                </h3>
                <p className="text-xs text-gray-500">/{restaurant.slug}</p>
              </div>
              {getSubscriptionBadge()}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} className="mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <Link
              to={restaurant ? `/restaurants/${restaurant.slug}` : '#'}
              target="_blank"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View Public Page →
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <MenuIcon size={24} />
            </button>

            <div className="flex items-center space-x-4">
              {/* User menu */}
              {restaurant && (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                      <User size={16} />
                    </div>
                    <span className="hidden md:block">{restaurant.contact_email}</span>
                    <ChevronDown size={16} className="ml-1" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <Link
                        to="/restaurant/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Account Settings
                      </Link>
                      <Link
                        to="/restaurant/billing"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Billing
                      </Link>
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut size={16} className="inline mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
}