import React, { useState } from 'react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';
import RestaurantLoginModal from './RestaurantLoginModal';
import RestaurantSignupModal from './RestaurantSignupModal';
import RestaurantHeader from './RestaurantHeader';
import RestaurantFooter from './RestaurantFooter';

interface RestaurantProtectedRouteProps {
  children: React.ReactNode;
}

export default function RestaurantProtectedRoute({ children }: RestaurantProtectedRouteProps) {
  const { restaurant, loading } = useRestaurantAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleCloseModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show minimal auth prompt (NOT full landing page)
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Restaurant Access Required
              </h1>
              <p className="text-gray-600">
                Please sign in to access your restaurant dashboard
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In to Your Account
              </button>
              
              <button
                onClick={() => setShowSignup(true)}
                className="w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Create Restaurant Account
              </button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>New to WhatTheMenu?</strong> Start your free 30-day trial today.
              </p>
            </div>
          </div>
        </div>

        {/* Modals */}
        <RestaurantLoginModal
          isOpen={showLogin}
          onClose={handleCloseModals}
          onSwitchToSignup={handleSwitchToSignup}
        />
        
        <RestaurantSignupModal
          isOpen={showSignup}
          onClose={handleCloseModals}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    );
  }

  // User is authenticated - render the protected content WITH header and footer
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RestaurantHeader />
      <main className="flex-1">
        {children}
      </main>
      <RestaurantFooter />
    </div>
  );
}