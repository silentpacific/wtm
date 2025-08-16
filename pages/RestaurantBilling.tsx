import React, { useState, useEffect } from 'react';
import { CreditCard, AlertTriangle, CheckCircle, X } from 'lucide-react';

export default function RestaurantBilling() {
  const [subscription, setSubscription] = useState({
    status: 'active', // 'trial', 'active', 'cancelled', 'expired'
    plan: 'monthly',
    amount: 25,
    currency: 'GBP',
    trial_ends_at: null,
    next_billing_date: '2025-09-16',
    cancel_at_period_end: false
  });

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const handleCancelSubscription = async () => {
    try {
      // Cancel subscription logic
      console.log('Cancelling subscription:', cancelReason);
      setSubscription({...subscription, cancel_at_period_end: true});
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      // Reactivate subscription logic
      console.log('Reactivating subscription');
      setSubscription({...subscription, cancel_at_period_end: false});
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Current Plan</h2>
            <div className="flex items-center gap-2">
              {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                <>
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-green-600 font-medium">Active</span>
                </>
              )}
              {subscription.status === 'trial' && (
                <>
                  <AlertTriangle size={20} className="text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Free Trial</span>
                </>
              )}
              {subscription.cancel_at_period_end && (
                <>
                  <AlertTriangle size={20} className="text-red-600" />
                  <span className="text-red-600 font-medium">Cancelling</span>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-lg font-semibold">Restaurant Monthly</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-lg font-semibold">
                {subscription.currency === 'GBP' ? '£' : '$'}{subscription.amount}/month
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="text-lg font-semibold">
                {subscription.cancel_at_period_end 
                  ? 'Plan ends ' + subscription.next_billing_date
                  : subscription.next_billing_date
                }
              </p>
            </div>
          </div>

          {/* Plan Features */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Plan includes:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited menu views</li>
              <li>• Multi-language dish explanations</li>
              <li>• QR code generation</li>
              <li>• Menu management dashboard</li>
              <li>• Basic analytics</li>
              <li>• Email support</li>
            </ul>
          </div>
        </div>

        {/* Billing Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage Subscription</h2>
          
          <div className="space-y-4">
            {!subscription.cancel_at_period_end ? (
              <>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Update Payment Method</h3>
                    <p className="text-sm text-gray-600">Change your credit card or billing information</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Update Payment
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Download Invoices</h3>
                    <p className="text-sm text-gray-600">Access your billing history and receipts</p>
                  </div>
                  <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                    View Invoices
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <h3 className="font-medium text-red-900">Cancel Subscription</h3>
                    <p className="text-sm text-red-600">Your plan will remain active until the end of the billing period</p>
                  </div>
                  <button 
                    onClick={() => setShowCancelModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Cancel Plan
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                <div>
                  <h3 className="font-medium text-green-900">Reactivate Subscription</h3>
                  <p className="text-sm text-green-600">Continue with your restaurant plan</p>
                </div>
                <button 
                  onClick={handleReactivateSubscription}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Reactivate Plan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                We're sorry to see you go! Your plan will remain active until {subscription.next_billing_date}.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Help us improve - why are you cancelling? (optional)
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select a reason</option>
                  <option value="too_expensive">Too expensive</option>
                  <option value="not_using">Not using the service</option>
                  <option value="missing_features">Missing features I need</option>
                  <option value="technical_issues">Technical issues</option>
                  <option value="switching_service">Switching to another service</option>
                  <option value="temporary">Temporary closure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                >
                  Confirm Cancellation
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Keep Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}