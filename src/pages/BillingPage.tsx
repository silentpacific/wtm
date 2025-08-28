// src/pages/BillingPage.tsx - Updated for new design system
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, CreditCard, Download, Calendar, BarChart3, Eye } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface BillingInfo {
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due';
  trial_end_date: string | null;
  next_billing_date: string | null;
  total_menu_views: number;
  total_qr_scans: number;
  current_month_views: number;
}

const BillingPage: React.FC = () => {
  const { user, restaurant } = useAuth();
  const [loading, setLoading] = useState(true);
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchBillingInfo();
  }, [user]);

  const fetchBillingInfo = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Mock billing data - in production this would come from your database
      // and payment processor (Stripe)
      const mockBillingInfo: BillingInfo = {
        subscription_status: 'trial',
        trial_end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        next_billing_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        total_menu_views: 147,
        total_qr_scans: 23,
        current_month_views: 89
      };

      setBillingInfo(mockBillingInfo);
    } catch (error: any) {
      console.error('Failed to fetch billing info:', error);
      setMessage({ type: 'error', text: 'Failed to load billing information' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    setProcessingPayment(true);
    setMessage(null);

    try {
      // In production, this would redirect to Stripe Checkout or open Stripe Elements
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ type: 'success', text: 'Payment method would be added via Stripe integration' });
      
      // Update billing info to show active subscription
      setBillingInfo(prev => prev ? {
        ...prev,
        subscription_status: 'active',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      } : null);

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to process payment method' });
    } finally {
      setProcessingPayment(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCancelSubscription = async () => {
    setProcessingPayment(true);
    setMessage(null);
    setShowCancelConfirm(false);

    try {
      // In production, this would call your backend to cancel with Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBillingInfo(prev => prev ? {
        ...prev,
        subscription_status: 'cancelled'
      } : null);

      setMessage({ type: 'success', text: 'Subscription cancelled. You can continue using the service until your trial ends.' });

    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to cancel subscription' });
    } finally {
      setProcessingPayment(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (dateString: string | null) => {
    if (!dateString) return 0;
    const endDate = new Date(dateString);
    const today = new Date();
    const timeDiff = endDate.getTime() - today.getTime();
    return Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">
          Loading billing information...
        </div>
      </DashboardLayout>
    );
  }

  const isOnTrial = billingInfo?.subscription_status === 'trial';
  const isActive = billingInfo?.subscription_status === 'active';
  const isCancelled = billingInfo?.subscription_status === 'cancelled';
  const daysRemaining = getDaysRemaining(billingInfo?.trial_end_date);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Billing & Subscription
        </h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-3" />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          {/* Current Plan Status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Current Plan
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                {isOnTrial && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900">
                      Free Trial
                    </h3>
                    <p className="text-gray-600">
                      {daysRemaining} days remaining
                    </p>
                  </>
                )}
                {isActive && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900">
                      Monthly Subscription
                    </h3>
                    <p className="text-gray-600">
                      $20/month • Active
                    </p>
                  </>
                )}
                {isCancelled && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900">
                      Cancelled
                    </h3>
                    <p className="text-gray-600">
                      Access until {formatDate(billingInfo?.trial_end_date)}
                    </p>
                  </>
                )}
              </div>
              
              <div className="text-right">
                {isOnTrial && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="font-medium text-amber-800">
                      Trial ends {formatDate(billingInfo?.trial_end_date)}
                    </p>
                  </div>
                )}
                {isActive && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-medium text-green-800">
                      Next billing: {formatDate(billingInfo?.next_billing_date)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold mb-2 text-gray-900">
                Simple Pricing
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-900">
                    <span className="font-semibold">Free Trial:</span> 30 days
                  </p>
                  <p className="text-gray-900">
                    <span className="font-semibold">Monthly:</span> $20 USD
                  </p>
                </div>
                
                {isOnTrial && !isCancelled && (
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={processingPayment}
                    className={`px-6 py-2 rounded-xl font-medium transition-colors flex items-center ${
                      processingPayment 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {processingPayment ? 'Processing...' : 'Add Payment Method'}
                  </button>
                )}
                
                {isActive && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={processingPayment}
                    className="px-6 py-2 rounded-xl font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Usage Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Eye size={20} className="text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {billingInfo?.total_menu_views || 0}
                </p>
                <p className="text-sm text-gray-500">Total Menu Views</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <BarChart3 size={20} className="text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {billingInfo?.current_month_views || 0}
                </p>
                <p className="text-sm text-gray-500">This Month</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <CreditCard size={20} className="text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {billingInfo?.total_qr_scans || 0}
                </p>
                <p className="text-sm text-gray-500">QR Code Scans</p>
              </div>
            </div>
          </div>

          {/* Restaurant Information */}
          {restaurant && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Restaurant Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Restaurant Name</p>
                  <p className="font-medium text-gray-900">{restaurant.restaurant_name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Menu URL</p>
                  <p className="font-mono text-sm text-gray-900">
                    {restaurant.url_slug ? `whatthemenu.com/r/${restaurant.url_slug}` : 'Not generated'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">
                    {restaurant.city ? `${restaurant.city}${restaurant.state ? `, ${restaurant.state}` : ''}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuisine Type</p>
                  <p className="font-medium text-gray-900">{restaurant.cuisine_type || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Billing History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Billing History
            </h2>
            
            <div className="space-y-3">
              {isOnTrial ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No billing history yet</p>
                  <p className="text-sm">Your first charge will appear after your trial ends</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Monthly Subscription</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$20.00</p>
                      <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        Invoice
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Cancel Subscription?
              </h3>
              <p className="mb-6 text-gray-600">
                You can continue using WhatTheMenu until your {isOnTrial ? 'trial' : 'current billing period'} ends on {formatDate(billingInfo?.trial_end_date || billingInfo?.next_billing_date)}. 
                You can reactivate anytime before then.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  disabled={processingPayment}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={processingPayment}
                  className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                    processingPayment 
                      ? 'bg-gray-400 cursor-not-allowed text-white' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  {processingPayment ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;