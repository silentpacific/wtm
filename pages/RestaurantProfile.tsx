// 5. CREATE: pages/RestaurantProfile.tsx
import React, { useState, useEffect } from 'react';
import { Save, AlertCircle } from 'lucide-react';

export default function RestaurantProfile() {
  const [profile, setProfile] = useState({
    business_name: '',
    slug: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    website: '',
    cuisine_type: '',
    opening_hours: '',
    special_notes: '',
    description_en: ''
  });
  
  const [originalSlug, setOriginalSlug] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Generate slug from business name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleBusinessNameChange = (name: string) => {
    setProfile({
      ...profile,
      business_name: name,
      slug: generateSlug(name)
    });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Save profile logic here
      console.log('Saving profile:', profile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
              <p className="text-gray-600">Manage your restaurant information and settings</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                value={profile.country}
                onChange={(e) => setProfile({...profile, country: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select country</option>
                <option value="UK">United Kingdom</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
              </select>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+44 20 1234 5678"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="https://yourrestaurant.com"
              />
            </div>

            {/* Cuisine Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Type</label>
              <select
                value={profile.cuisine_type}
                onChange={(e) => setProfile({...profile, cuisine_type: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select cuisine type</option>
                <option value="British">British</option>
                <option value="Italian">Italian</option>
                <option value="French">French</option>
                <option value="Indian">Indian</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Mexican">Mexican</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="American">American</option>
                <option value="Thai">Thai</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Opening Hours */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
              <textarea
                value={profile.opening_hours}
                onChange={(e) => setProfile({...profile, opening_hours: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg h-20 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Mon-Fri: 12:00-22:00, Sat-Sun: 11:00-23:00"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Description</label>
              <textarea
                value={profile.description_en}
                onChange={(e) => setProfile({...profile, description_en: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg h-24 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            {/* Special Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes</label>
              <textarea
                value={profile.special_notes}
                onChange={(e) => setProfile({...profile, special_notes: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg h-20 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Any special notes for customers (allergies, reservations, etc.)"
              />
            </div>
          </div>

          {/* Email Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Email address cannot be changed here. Contact support if you need to update your email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. CREATE: pages/RestaurantBilling.tsx
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
                {subscription.currency === 'GBP' ? '£' : ' Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={profile.business_name}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Your Restaurant Name"
              />
            </div>

            {/* URL Slug */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant URL
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-600 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300">
                  whatthemenu.com/restaurants/
                </span>
                <input
                  type="text"
                  value={profile.slug}
                  onChange={(e) => setProfile({...profile, slug: e.target.value})}
                  disabled={!isEditing}
                  className="flex-1 p-3 border border-gray-300 rounded-r-lg disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="your-restaurant-name"
                />
              </div>
              {profile.slug !== originalSlug && isEditing && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Changing your URL will affect your QR codes and existing links
                  </span>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="123 High Street"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="London"
              />
            </div>

            {/*}{subscription.amount}/month
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
} Business Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={profile.business_name}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Your Restaurant Name"
              />
            </div>

            {/* URL Slug */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant URL
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 text-gray-600 px-3 py-3 rounded-l-lg border border-r-0 border-gray-300">
                  whatthemenu.com/restaurants/
                </span>
                <input
                  type="text"
                  value={profile.slug}
                  onChange={(e) => setProfile({...profile, slug: e.target.value})}
                  disabled={!isEditing}
                  className="flex-1 p-3 border border-gray-300 rounded-r-lg disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="your-restaurant-name"
                />
              </div>
              {profile.slug !== originalSlug && isEditing && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2">
                  <AlertCircle size={16} className="text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Changing your URL will affect your QR codes and existing links
                  </span>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="123 High Street"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                disabled={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="London"
              />
            </div>

            {/*