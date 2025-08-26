// src/pages/BillingPage.tsx - Simple subscription billing
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
  const { user } = useAuth();
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
        <div className="text-center py-12" style={{ color: 'var(--wtm-muted)' }}>
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
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--wtm-text)' }}>
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
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
              Current Plan
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                {isOnTrial && (
                  <>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                      Free Trial
                    </h3>
                    <p style={{ color: 'var(--wtm-muted)' }}>
                      {daysRemaining} days remaining
                    </p>
                  </>
                )}
                {isActive && (
                  <>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                      Monthly Subscription
                    </h3>
                    <p style={{ color: 'var(--wtm-muted)' }}>
                      $20/month • Active
                    </p>
                  </>
                )}
                {isCancelled && (
                  <>
                    <h3 className="text-xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                      Cancelled
                    </h3>
                    <p style={{ color: 'var(--wtm-muted)' }}>
                      Access until {formatDate(billingInfo?.trial_end_date)}
                    </p>
                  </>
                )}
              </div>
              
              <div className="text-right">
                {isOnTrial && (
                  <div className="p-3 rounded-lg" 
                       style={{ backgroundColor: 'var(--chip-nuts-bg)' }}>
                    <p className="font-medium" style={{ color: 'var(--chip-nuts-fg)' }}>
                      Trial ends {formatDate(billingInfo?.trial_end_date)}
                    </p>
                  </div>
                )}
                {isActive && (
                  <div className="p-3 rounded-lg" 
                       style={{ backgroundColor: 'var(--chip-veg-bg)' }}>
                    <p className="font-medium" style={{ color: 'var(--chip-veg-fg)' }}>
                      Next billing: {formatDate(billingInfo?.next_billing_date)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t pt-4" style={{ borderColor: '#EFE7E2' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--wtm-text)' }}>
                Simple Pricing
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: 'var(--wtm-text)' }}>
                    <span className="font-semibold">Free Trial:</span> 30 days
                  </p>
                  <p style={{ color: 'var(--wtm-text)' }}>
                    <span className="font-semibold">Monthly:</span> $20 USD
                  </p>
                </div>
                
                {isOnTrial && !isCancelled && (
                  <button
                    onClick={handleAddPaymentMethod}
                    disabled={processingPayment}
                    className={`btn flex items-center ${
                      processingPayment ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'
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
                    className="btn btn-danger-ghost"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
              Usage Statistics
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--chip-shell-bg)' }}>
                  <Eye size={20} style={{ color: 'var(--chip-shell-fg)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {billingInfo?.total_menu_views || 0}
                </p>
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>Total Menu Views</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--chip-dairy-bg)' }}>
                  <BarChart3 size={20} style={{ color: 'var(--chip-dairy-fg)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {billingInfo?.current_month_views || 0}
                </p>
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>This Month</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg mx-auto mb-2 flex items-center justify-center" 
                     style={{ backgroundColor: 'var(--chip-veg-bg)' }}>
                  <CreditCard size={20} style={{ color: 'var(--chip-veg-fg)' }} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  {billingInfo?.total_qr_scans || 0}
                </p>
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>QR Code Scans</p>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
              Billing History
            </h2>
            
            <div className="space-y-3">
              {isOnTrial ? (
                <div className="text-center py-8" style={{ color: 'var(--wtm-muted)' }}>
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No billing history yet</p>
                  <p className="text-sm">Your first charge will appear after your trial ends</p>
                </div>
              ) : (
                // Mock billing history for active subscriptions
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg" 
                       style={{ backgroundColor: 'var(--wtm-bg)' }}>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--wtm-text)' }}>Monthly Subscription</p>
                      <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                        {formatDate(new Date().toISOString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold" style={{ color: 'var(--wtm-text)' }}>$20.00</p>
                      <button className="btn-ghost text-sm flex items-center">
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
            <div className="card p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
                Cancel Subscription?
              </h3>
              <p className="mb-6" style={{ color: 'var(--wtm-muted)' }}>
                You can continue using WhatTheMenu until your {isOnTrial ? 'trial' : 'current billing period'} ends on {formatDate(billingInfo?.trial_end_date || billingInfo?.next_billing_date)}. 
                You can reactivate anytime before then.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="btn btn-secondary flex-1"
                  disabled={processingPayment}
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={processingPayment}
                  className={`btn flex-1 ${
                    processingPayment ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-danger-ghost'
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