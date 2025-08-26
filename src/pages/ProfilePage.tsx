// src/pages/ProfilePage.tsx - Using new combined table
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserRestaurantProfile {
  id: string;
  // User fields
  full_name: string | null;
  subscription_type: string;
  email: string | null;
  // Restaurant fields
  restaurant_name: string | null;
  cuisine_type: string | null;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

const ProfilePage: React.FC = () => {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<UserRestaurantProfile | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);

      try {
        const { data: profileData, error } = await supabase
          .from('user_restaurant_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw new Error(`Failed to load profile: ${error.message}`);
        }

        // If no profile exists, create a default one
        if (!profileData) {
          setProfile({
            id: user.id,
            full_name: null,
            subscription_type: 'free',
            email: user.email || null,
            restaurant_name: null,
            cuisine_type: null,
            owner_name: null,
            phone: null,
            address: null,
            city: null,
            state: null,
            country: null,
          });
        } else {
          setProfile(profileData);
        }
        
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        setMessage({ type: 'error', text: err.message || 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, authLoading]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_restaurant_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name?.trim() || null,
          subscription_type: profile.subscription_type || 'free',
          email: profile.email || user.email || null,
          restaurant_name: profile.restaurant_name?.trim() || null,
          cuisine_type: profile.cuisine_type?.trim() || null,
          owner_name: profile.owner_name?.trim() || null,
          phone: profile.phone?.trim() || null,
          address: profile.address?.trim() || null,
          city: profile.city?.trim() || null,
          state: profile.state?.trim() || null,
          country: profile.country?.trim() || null,
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw new Error(`Failed to save profile: ${error.message}`);
      }

      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-600">
          Loading authentication...
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-red-600">
          Please log in to view your profile.
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-600">
          Loading your profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Profile Settings</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* User Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter your full name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed from this page</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Type
                </label>
                <select
                  value={profile?.subscription_type || 'free'}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, subscription_type: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Restaurant Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Restaurant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={profile?.restaurant_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, restaurant_name: e.target.value } : null)}
                  placeholder="Enter restaurant name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={profile?.cuisine_type || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, cuisine_type: e.target.value } : null)}
                  placeholder="e.g., Italian, Asian, American"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={profile?.owner_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, owner_name: e.target.value } : null)}
                  placeholder="Restaurant owner name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Street address"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, city: e.target.value } : null)}
                  placeholder="City"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={profile?.state || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, state: e.target.value } : null)}
                  placeholder="State or Province"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={profile?.country || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, country: e.target.value } : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                >
                  <option value="">Select a country</option>
                  <option value="Australia">Australia</option>
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Japan">Japan</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !profile}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-coral-600 hover:bg-coral-700 focus:ring-2 focus:ring-coral-500 focus:ring-offset-2'
            }`}
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;