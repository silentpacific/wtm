// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  id: string;
  full_name: string | null;
  subscription_type: string;
  email?: string;
}

interface RestaurantData {
  id?: number;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  address: string;
  owner_name: string;
}

const ProfilePage: React.FC = () => {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [hasRestaurantPermissions, setHasRestaurantPermissions] = useState(true);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchProfileData = async () => {
      setLoading(true);

      try {
        // 1. User profile - always try this first
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, full_name, subscription_type, email')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error('Failed to load user profile');
        }

        setUserProfile(profile || {
          id: user.id,
          full_name: null,
          subscription_type: 'free',
          email: user.email || undefined
        });

        // 2. Restaurant profile - test permissions
        try {
          const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id, name, cuisine_type, city, state, country, phone, address, owner_name')
            .eq('auth_user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (restaurantError) {
            // Check if it's a permissions error
            if (restaurantError.code === 'PGRST116' || restaurantError.message?.includes('permission') || restaurantError.message?.includes('policy')) {
              setHasRestaurantPermissions(false);
              setMessage({ 
                type: 'warning', 
                text: 'Restaurant data is not accessible due to database permissions. Contact support if you need to manage restaurant information.' 
              });
            } else {
              throw new Error(`Failed to load restaurant data: ${restaurantError.message}`);
            }
          } else {
            setHasRestaurantPermissions(true);
            setRestaurantData(restaurant || {
              name: '',
              cuisine_type: '',
              city: '',
              state: '',
              country: '',
              phone: '',
              address: '',
              owner_name: '',
            });
          }
        } catch (restaurantError: any) {
          console.warn('Restaurant data unavailable:', restaurantError);
          setHasRestaurantPermissions(false);
          setRestaurantData({
            name: '',
            cuisine_type: '',
            city: '',
            state: '',
            country: '',
            phone: '',
            address: '',
            owner_name: '',
          });
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
    if (!user || !userProfile) return;
    setSaving(true);
    setMessage(null);

    try {
      let userSaved = false;
      let restaurantSaved = false;

      // Try to save user profile
      try {
        const { error: userError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            full_name: userProfile.full_name?.trim() || '',
            subscription_type: userProfile.subscription_type || 'free',
          }, {
            onConflict: 'id'
          });

        if (userError) {
          throw new Error(`User profile save failed: ${userError.message}`);
        }
        userSaved = true;
      } catch (userError: any) {
        console.error('User profile save error:', userError);
        throw new Error(`Failed to save user profile: ${userError.message}`);
      }

      // Try to save restaurant data if permissions allow and data exists
      if (hasRestaurantPermissions && restaurantData) {
        try {
          if (restaurantData.id) {
            // Update existing restaurant
            const { error: restError } = await supabase
              .from('restaurants')
              .update({
                name: restaurantData.name?.trim() || '',
                cuisine_type: restaurantData.cuisine_type?.trim() || '',
                city: restaurantData.city?.trim() || '',
                state: restaurantData.state?.trim() || '',
                country: restaurantData.country?.trim() || '',
                phone: restaurantData.phone?.trim() || '',
                address: restaurantData.address?.trim() || '',
                owner_name: restaurantData.owner_name?.trim() || '',
              })
              .eq('id', restaurantData.id);

            if (restError) {
              throw new Error(`Restaurant update failed: ${restError.message}`);
            }
            restaurantSaved = true;
          } else {
            // Try to create new restaurant
            const { data: newRestaurant, error: insertError } = await supabase
              .from('restaurants')
              .insert([{
                auth_user_id: user.id,
                name: restaurantData.name?.trim() || '',
                cuisine_type: restaurantData.cuisine_type?.trim() || '',
                city: restaurantData.city?.trim() || '',
                state: restaurantData.state?.trim() || '',
                country: restaurantData.country?.trim() || '',
                phone: restaurantData.phone?.trim() || '',
                address: restaurantData.address?.trim() || '',
                owner_name: restaurantData.owner_name?.trim() || '',
              }])
              .select()
              .single();

            if (insertError) {
              throw new Error(`Restaurant creation failed: ${insertError.message}`);
            }
            
            setRestaurantData(prev => prev ? { ...prev, id: newRestaurant.id } : null);
            restaurantSaved = true;
          }
        } catch (restError: any) {
          console.error('Restaurant save error:', restError);
          // Don't fail the entire save if only restaurant fails
          console.warn('Restaurant data could not be saved:', restError.message);
        }
      }

      // Show appropriate success message
      if (userSaved && restaurantSaved) {
        setMessage({ type: 'success', text: 'Profile and restaurant information saved successfully!' });
      } else if (userSaved && !hasRestaurantPermissions) {
        setMessage({ type: 'success', text: 'User profile saved successfully! Restaurant data is not accessible due to permissions.' });
      } else if (userSaved) {
        setMessage({ type: 'warning', text: 'User profile saved successfully! Restaurant data could not be saved - check permissions.' });
      } else {
        throw new Error('Failed to save any data');
      }
      
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 8000);
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
                : message.type === 'warning'
                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
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
                  value={userProfile?.full_name || ''}
                  onChange={(e) => setUserProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
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
                  value={userProfile?.email || user?.email || ''}
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
                  value={userProfile?.subscription_type || 'free'}
                  onChange={(e) => setUserProfile(prev => prev ? { ...prev, subscription_type: e.target.value } : null)}
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
          <div className={`bg-white p-6 rounded-lg shadow-sm border ${!hasRestaurantPermissions ? 'opacity-75' : ''}`}>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
              Restaurant Information
              {!hasRestaurantPermissions && (
                <span className="ml-2 text-sm text-yellow-600 font-normal">(Limited Access)</span>
              )}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantData?.name || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter restaurant name"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={restaurantData?.cuisine_type || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, cuisine_type: e.target.value } : null)}
                  placeholder="e.g., Italian, Asian, American"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  value={restaurantData?.owner_name || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, owner_name: e.target.value } : null)}
                  placeholder="Restaurant owner name"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={restaurantData?.phone || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                  placeholder="+1 (555) 123-4567"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={restaurantData?.address || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, address: e.target.value } : null)}
                  placeholder="Street address"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={restaurantData?.city || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, city: e.target.value } : null)}
                  placeholder="City"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={restaurantData?.state || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, state: e.target.value } : null)}
                  placeholder="State or Province"
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={restaurantData?.country || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, country: e.target.value } : null)}
                  disabled={!hasRestaurantPermissions}
                  className={`w-full border rounded-lg px-3 py-2 ${
                    hasRestaurantPermissions 
                      ? 'border-gray-300 focus:ring-2 focus:ring-coral-500 focus:border-coral-500' 
                      : 'border-gray-200 bg-gray-50 text-gray-400'
                  }`}
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
            disabled={saving || !userProfile}
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