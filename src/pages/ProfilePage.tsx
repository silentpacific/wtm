// src/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import DashboardLayout from '../components/DashboardLayout';
import { User, Building, Mail, Phone, MapPin, Loader } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  subscription_type: string;
}

interface RestaurantData {
  id: number;
  name: string;
  cuisine_type: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  phone: string | null;
  address: string | null;
  owner_name: string | null;
}

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    console.log('ProfilePage mounted - authLoading:', authLoading, 'user:', user?.id);
    
    // If we have a user but auth is still loading, something is stuck
    // Let's work around this by giving it a reasonable timeout
    if (user && authLoading) {
      console.log('User exists but authLoading is stuck, proceeding anyway');
      const timeout = setTimeout(() => {
        if (user) {
          fetchProfileData();
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
    
    if (authLoading) {
      // Still loading auth state, wait
      return;
    }
    
    if (user) {
      fetchProfileData();
    }
    // If not loading and no user, component will show login prompt
  }, [user, authLoading]);

  const fetchProfileData = async () => {
    if (!user) return;

    console.log('Starting fetchProfileData for user:', user.id);
    setLoading(true);
    
    try {
      // Fetch or create user profile
      let { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, subscription_type')
        .eq('id', user.id)
        .single();

      console.log('Profile query result:', { profile, error: profileError });

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Creating new user profile');
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              id: user.id,
              email: user.email,
              subscription_type: 'free',
              full_name: null
            }])
            .select('id, email, full_name, subscription_type')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          profile = newProfile;
        } else {
          throw profileError;
        }
      }

      setUserProfile(profile);
      console.log('User profile set:', profile);

      // Fetch restaurant data
		const { data, error } = await supabase
		  .from('restaurants')
		  .select('id, name, cuisine_type, city, state, country, phone, address, owner_name, auth_user_id')
		  .eq('auth_user_id', user.id)
		  .single();

      console.log('Restaurant query result:', { restaurant, error: restaurantError });

      if (restaurantError && restaurantError.code !== 'PGRST116') {
        console.error('Restaurant fetch error:', restaurantError);
        // Don't throw - restaurant data is optional
      } else if (restaurant) {
        setRestaurantData(restaurant);
      }

    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load profile data: ${(error as any)?.message || 'Unknown error'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (field: keyof UserProfile, value: any) => {
    if (!user || !userProfile) return;

    setSaving(true);
    setMessage(null);

    try {
      console.log(`Updating profile ${field}:`, value);
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: value })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setUserProfile(prev => prev ? { ...prev, [field]: value } : null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurantUpdate = async (field: keyof RestaurantData, value: any) => {
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      console.log(`Updating restaurant ${field}:`, value);

      if (restaurantData?.id) {
        // Update existing restaurant
        const { error } = await supabase
          .from('restaurants')
          .update({ [field]: value })
          .eq('id', restaurantData.id);

        if (error) throw error;
        
        setRestaurantData(prev => prev ? { ...prev, [field]: value } : null);
      } else {
        // Create new restaurant
        const newRestaurant = {
          name: field === 'name' ? value : '',
          [field]: value,
          auth_user_id: user.id
        };

		const { data, error } = await supabase
		  .from('restaurants')
		  .select('id, name, cuisine_type, city, state, country, phone, address, owner_name, auth_user_id')
		  .eq('auth_user_id', user.id)
		  .single();

        if (error) throw error;
        
        setRestaurantData(data);
      }

      setMessage({ type: 'success', text: 'Restaurant updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Restaurant update error:', error);
      setMessage({ type: 'error', text: 'Failed to update restaurant' });
    } finally {
      setSaving(false);
    }
  };

  // Show loading state only for our profile data loading
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-coral-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show login prompt only if we're sure there's no user (not if auth is just loading)
  if (!user && !authLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to view your profile.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-coral-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your personal and restaurant information</p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? '✓' : '⚠'} {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-coral-100 rounded-lg mr-3">
                <User className="w-5 h-5 text-coral-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userProfile?.full_name || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setUserProfile(prev => prev ? { ...prev, full_name: newValue } : null);
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value.trim();
                    if (newValue !== userProfile?.full_name) {
                      handleProfileUpdate('full_name', newValue || null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{userProfile?.email || user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Email cannot be changed here. Contact support if you need to update your email.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subscription Plan
                </label>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-700 capitalize font-medium">
                    {userProfile?.subscription_type || 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Restaurant Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-coral-100 rounded-lg mr-3">
                <Building className="w-5 h-5 text-coral-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Restaurant Information</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restaurantData?.name || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRestaurantData(prev => prev ? { ...prev, name: newValue } : {
                      id: 0, name: newValue, cuisine_type: null, city: null, 
                      state: null, country: null, phone: null, address: null, owner_name: null
                    });
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value.trim();
                    if (newValue && newValue !== (restaurantData?.name || '')) {
                      handleRestaurantUpdate('name', newValue);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                  placeholder="Enter restaurant name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={restaurantData?.cuisine_type || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setRestaurantData(prev => prev ? { ...prev, cuisine_type: newValue } : null);
                  }}
                  onBlur={(e) => {
                    const newValue = e.target.value.trim();
                    if (newValue !== (restaurantData?.cuisine_type || '')) {
                      handleRestaurantUpdate('cuisine_type', newValue || null);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                  placeholder="e.g., Italian, Japanese, American"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={restaurantData?.city || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRestaurantData(prev => prev ? { ...prev, city: newValue } : null);
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value.trim();
                      if (newValue !== (restaurantData?.city || '')) {
                        handleRestaurantUpdate('city', newValue || null);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={restaurantData?.state || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRestaurantData(prev => prev ? { ...prev, state: newValue } : null);
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value.trim();
                      if (newValue !== (restaurantData?.state || '')) {
                        handleRestaurantUpdate('state', newValue || null);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                    placeholder="State/Province"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={restaurantData?.phone || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRestaurantData(prev => prev ? { ...prev, phone: newValue } : null);
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value.trim();
                      if (newValue !== (restaurantData?.phone || '')) {
                        handleRestaurantUpdate('phone', newValue || null);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={restaurantData?.address || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setRestaurantData(prev => prev ? { ...prev, address: newValue } : null);
                    }}
                    onBlur={(e) => {
                      const newValue = e.target.value.trim();
                      if (newValue !== (restaurantData?.address || '')) {
                        handleRestaurantUpdate('address', newValue || null);
                      }
                    }}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-coral-500 transition-colors resize-none"
                    placeholder="Restaurant address"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {saving && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center">
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Saving changes...
          </div>
        )}
		
		<div className="mt-8 text-right">
  <button
    onClick={async () => {
      setSaving(true);
      setMessage(null);
      try {
        if (userProfile) {
          await supabase
            .from('user_profiles')
            .update({
              full_name: userProfile.full_name,
              subscription_type: userProfile.subscription_type
            })
            .eq('id', user?.id);
        }
        if (restaurantData) {
          await supabase
            .from('restaurants')
            .update({
              name: restaurantData.name,
              cuisine_type: restaurantData.cuisine_type,
              city: restaurantData.city,
              state: restaurantData.state,
              country: restaurantData.country,
              phone: restaurantData.phone,
              address: restaurantData.address,
              owner_name: restaurantData.owner_name
            })
            .eq('id', restaurantData.id);
        }
        setMessage({ type: 'success', text: 'All changes saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to save changes' });
      } finally {
        setSaving(false);
      }
    }}
    className="px-6 py-3 bg-coral-600 text-white font-semibold rounded-lg hover:bg-coral-700 transition-colors"
  >
    Save Changes
  </button>
</div>

		
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;