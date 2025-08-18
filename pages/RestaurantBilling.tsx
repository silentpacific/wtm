import React from 'react';
import { CreditCard, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRestaurantAuth } from '../contexts/RestaurantAuthContext';

export default function RestaurantBilling() {
  const { restaurant } = useRestaurantAuth();

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Loading billing information...</p>
        </div>
      </div>
    );
  }

  const isTrialActive = restaurant.subscription_status === 'trial';
  const trialExpiresAt = restaurant.trial_expires_at ? new Date(restaurant.trial_expires_at) : null;
  const daysRemaining = trialExpiresAt ? Math.ceil((trialExpiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {isTrialActive ? (
              <AlertTriangle className="text-yellow-500" size={24} />
            ) : (
              <CheckCircle className="text-green-500" size={24} />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {isTrialActive ? 'Free Trial Active' : 'Active Subscription'}
              </p>
              <p className="text-sm text-gray-500">
                {isTrialActive 
                  ? `${daysRemaining} days remaining in trial`
                  : 'Monthly subscription - £25/month'
                }
              </p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isTrialActive 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {isTrialActive ? 'Trial' : 'Active'}
          </span>
        </div>

        {isTrialActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Calendar className="text-yellow-600 mt-0.5" size={16} />
              <div>
                <p className="font-medium text-yellow-800">Trial expires on {trialExpiresAt?.toLocaleDateString()}</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Subscribe now to continue using WhatTheMenu after your trial ends. 
                  No interruption to your service when you upgrade.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          {isTrialActive ? (
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Subscribe Now - £25/month
            </button>
          ) : (
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Manage Subscription
            </button>
          )}
          
          <button className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Download Invoice
          </button>
        </div>
      </div>

      {/* Pricing Plan */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Plan</h2>
        
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Restaurant Plan</h3>
              <p className="text-gray-600 text-sm">Everything you need for accessible dining</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">£25</p>
              <p className="text-gray-600 text-sm">per month</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Professional menu page</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>QR codes for tables</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Multi-language explanations</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Allergen detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Basic analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>Email support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      {!isTrialActive && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-gray-400" size={24} />
              <div>
                <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/25</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Update
            </button>
          </div>
          
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            + Add Payment Method
          </button>
        </div>
      )}

      {/* Billing History */}
      {!isTrialActive && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">January 2025</p>
                <p className="text-sm text-gray-500">Paid on Jan 1, 2025</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">£25.00</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">December 2024</p>
                <p className="text-sm text-gray-500">Paid on Dec 1, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">£25.00</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">November 2024</p>
                <p className="text-sm text-gray-500">Paid on Nov 1, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">£25.00</p>
                <button className="text-blue-600 hover:text-blue-700 text-sm">Download</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Have questions about your subscription or billing? We're here to help.
        </p>
        <div className="flex gap-4">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Contact Support
          </button>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View FAQ
          </button>
        </div>
      </div>
    </div>
  );
}