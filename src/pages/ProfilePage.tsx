// src/pages/ProfilePage.tsx - Updated for new auth structure and design system
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserRestaurantProfile {
  id: string;
  auth_user_id: string;
  full_name: string | null;
  email: string | null;
  restaurant_name: string | null;
  cuisine_type: string | null;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  url_slug: string | null;
  subscription_type: string;
}

const ProfilePage: React.FC = () => {
  const { user, restaurant, authLoading, refreshAuth } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [profile, setProfile] = useState<UserRestaurantProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (restaurant) {
      setProfile(restaurant);
      setLoading(false);
    } else {
      fetchProfileData();
    }
  }, [user, restaurant, authLoading]);

  const fetchProfileData = async () => {
    if (!user) return;
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

      if (!profileData) {
        // Create default profile if none exists
        const defaultProfile: UserRestaurantProfile = {
          id: user.id,
          auth_user_id: user.id,
          full_name: null,
          email: user.email || null,
          restaurant_name: null,
          cuisine_type: null,
          owner_name: null,
          phone: null,
          address: null,
          city: null,
          state: null,
          country: null,
          url_slug: null,
          subscription_type: 'free'
        };
        setProfile(defaultProfile);
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

	const handleSave = async () => {
	  if (!user || !profile) return;
	  setSaving(true);
	  setMessage(null);

	  try {
		const { error } = await supabase
		  .from('user_restaurant_profiles')
		  .upsert({
			id: user.id,
			auth_user_id: user.id,
			full_name: profile.full_name?.trim() || null,
			email: profile.email || user.email || null,
			restaurant_name: profile.restaurant_name?.trim() || null,
			cuisine_type: profile.cuisine_type?.trim() || null,
			owner_name: profile.owner_name?.trim() || null,
			phone: profile.phone?.trim() || null,
			address: profile.address?.trim() || null,
			city: profile.city?.trim() || null,
			state: profile.state?.trim() || null,
			country: profile.country?.trim() || null,
			url_slug: profile.url_slug,
			subscription_type: profile.subscription_type || 'free'
		  }, {
			onConflict: 'id'
		  });

		if (error) {
		  throw new Error(`Failed to save profile: ${error.message}`);
		}

		setMessage({ type: 'success', text: 'Profile saved successfully!' });

		// 🔄 Refresh auth context so changes apply immediately
		await refreshAuth();

		// 🚀 Redirect only if required fields are complete
		if (profile.restaurant_name && profile.city) {
		  window.location.href = "/dashboard/menu-editor";
		}

	  } catch (err: any) {
		console.error('Save error:', err);
		setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
	  } finally {
		setSaving(false);
		setTimeout(() => setMessage(null), 5000);
	  }
	};


  const handlePasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in both password fields' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setChangingPassword(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: any) {
      console.error('Password change error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-gray-500">
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
        <div className="text-center py-12 text-gray-500">
          Loading your profile...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Profile Settings
        </h1>

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
          {/* Account Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Account
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Change Password
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={changingPassword || !newPassword || !confirmPassword}
                  className={`mt-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    changingPassword || !newPassword || !confirmPassword 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {changingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>

          {/* Restaurant Profile Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Restaurant Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={profile?.restaurant_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, restaurant_name: e.target.value } : null)}
                  placeholder="Enter restaurant name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={profile?.cuisine_type || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, cuisine_type: e.target.value } : null)}
                  placeholder="e.g., Italian, Asian, American"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={profile?.owner_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, owner_name: e.target.value } : null)}
                  placeholder="Restaurant owner name"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Phone
                </label>
                <input
                  type="tel"
                  value={profile?.phone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="+61 8 1234 5678"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Address
                </label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Street address"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  City
                </label>
                <input
                  type="text"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, city: e.target.value } : null)}
                  placeholder="City"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  State/Province
                </label>
                <input
                  type="text"
                  value={profile?.state || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, state: e.target.value } : null)}
                  placeholder="State or Province"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-900">
                  Country
                </label>
                <select
                  value={profile?.country || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, country: e.target.value } : null)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
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

              {/* URL Slug Display (Read-only) */}
              {profile?.url_slug && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-900">
                    Restaurant URL
                  </label>
                  <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-600 font-mono text-sm">
                    whatthemenu.com/r/{profile.url_slug}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This URL cannot be changed and is used for your QR codes
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !profile}
            className={`px-8 py-3 rounded-xl font-semibold transition-colors ${
              saving 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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