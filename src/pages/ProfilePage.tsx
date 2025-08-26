// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

// Define proper types based on your database schema
interface UserProfile {
  id: string;
  full_name: string | null;
  subscription_type: string;
  email?: string;
}

interface RestaurantData {
  id: number;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  address: string;
  owner_name: string;
  auth_user_id: string;
}

interface ValidationErrors {
  userProfile?: Record<string, string>;
  restaurant?: Record<string, string>;
}

const ProfilePage: React.FC = () => {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);

  // Validation functions
  const validateUserProfile = (profile: UserProfile): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!profile.full_name?.trim()) {
      errors.full_name = 'Full name is required';
    }
    
    return errors;
  };

  const validateRestaurantData = (restaurant: RestaurantData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    if (!restaurant.name?.trim()) {
      errors.name = 'Restaurant name is required';
    }
    
    if (!restaurant.owner_name?.trim()) {
      errors.owner_name = 'Owner name is required';
    }
    
    if (restaurant.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(restaurant.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    return errors;
  };

  // 🔹 Fetch profile + restaurant
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      setLoading(true);
      setMessage(null);

      try {
        // 1. User profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, full_name, subscription_type, email')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw new Error('Failed to load user profile');
        }

        setUserProfile(profile || {
          id: user.id,
          full_name: null,
          subscription_type: 'free',
          email: user.email || undefined
        });

        // 2. Restaurant profile
        let { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select(`
            id, name, cuisine_type, city, state, country, 
            phone, address, owner_name, auth_user_id
          `)
          .eq('auth_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (restaurantError) {
          console.error('Restaurant fetch error:', restaurantError);
          throw new Error('Failed to load restaurant data');
        }

        // If no restaurant row, create one
        if (!restaurant) {
          const { data: newRestaurant, error: insertError } = await supabase
            .from('restaurants')
            .insert([
              {
                auth_user_id: user.id,
                name: '',
                cuisine_type: '',
                city: '',
                state: '',
                country: '',
                phone: '',
                address: '',
                owner_name: '',
              },
            ])
            .select(`
              id, name, cuisine_type, city, state, country, 
              phone, address, owner_name, auth_user_id
            `)
            .single();

          if (insertError) {
            console.error('Restaurant creation error:', insertError);
            throw new Error('Failed to create restaurant profile');
          }
          restaurant = newRestaurant;
        }

        setRestaurantData(restaurant);
      } catch (err) {
        console.error('Fetch profile error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile data';
        setMessage({ type: 'error', text: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  // 🔹 Save button handler
  const handleSave = async () => {
    if (!user || !userProfile || !restaurantData) return;
    
    // Validate data
    const userErrors = validateUserProfile(userProfile);
    const restaurantErrors = validateRestaurantData(restaurantData);
    
    if (Object.keys(userErrors).length > 0 || Object.keys(restaurantErrors).length > 0) {
      setValidationErrors({
        userProfile: userErrors,
        restaurant: restaurantErrors
      });
      setMessage({ type: 'error', text: 'Please fix the errors below before saving' });
      return;
    }
    
    setValidationErrors({});
    setSaving(true);
    setMessage(null);

    try {
      // Update user profile
      const { error: userError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: userProfile.full_name?.trim(),
          subscription_type: userProfile.subscription_type,
        }, {
          onConflict: 'id'
        });

      if (userError) {
        console.error('User update error:', userError);
        throw new Error('Failed to update user profile');
      }

      // Update restaurant data
      const { error: restError } = await supabase
        .from('restaurants')
        .update({
          name: restaurantData.name?.trim(),
          cuisine_type: restaurantData.cuisine_type?.trim(),
          city: restaurantData.city?.trim(),
          state: restaurantData.state?.trim(),
          country: restaurantData.country?.trim(),
          phone: restaurantData.phone?.trim(),
          address: restaurantData.address?.trim(),
          owner_name: restaurantData.owner_name?.trim(),
        })
        .eq('id', restaurantData.id);

      if (restError) {
        console.error('Restaurant update error:', restError);
        throw new Error('Failed to update restaurant information');
      }

      setMessage({ type: 'success', text: 'All changes saved successfully!' });
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save changes';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
      // Clear success message after 5 seconds
      if (message?.type === 'success') {
        setTimeout(() => setMessage(null), 5000);
      }
    }
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if no user
  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-red-600">Please log in to view your profile.</p>
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
            <div className="flex items-center">
              <span className={`mr-2 ${message.type === 'success' ? '✅' : '❌'}`}>
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* User Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">User Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={userProfile?.full_name || ''}
                  onChange={(e) => setUserProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                  placeholder="Enter your full name"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    validationErrors.userProfile?.full_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.userProfile?.full_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.userProfile.full_name}</p>
                )}
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
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Restaurant Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  value={restaurantData?.name || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Enter restaurant name"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    validationErrors.restaurant?.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.restaurant?.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.restaurant.name}</p>
                )}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  value={restaurantData?.owner_name || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, owner_name: e.target.value } : null)}
                  placeholder="Restaurant owner name"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    validationErrors.restaurant?.owner_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.restaurant?.owner_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.restaurant.owner_name}</p>
                )}
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
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500 ${
                    validationErrors.restaurant?.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {validationErrors.restaurant?.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.restaurant.phone}</p>
                )}
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-coral-500 focus:border-coral-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <select
                  value={restaurantData?.country || ''}
                  onChange={(e) => setRestaurantData(prev => prev ? { ...prev, country: e.target.value } : null)}
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
            disabled={saving || !userProfile || !restaurantData}
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