// src/pages/ProfilePage.tsx - Detailed Debug Version
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const authContext = useAuth();
  console.log('[ProfilePage] Auth context received:', {
    user: authContext.user ? 'exists' : 'null',
    authLoading: authContext.authLoading,
    authLoadingType: typeof authContext.authLoading,
    restaurant: authContext.restaurant ? 'exists' : 'null'
  });

  const { user, authLoading } = authContext;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // 🔹 Fetch profile + restaurant
  useEffect(() => {
    console.log('[ProfilePage] useEffect triggered', { 
      authLoading: authLoading, 
      authLoadingType: typeof authLoading,
      user: user ? 'exists' : 'null',
      userId: user?.id 
    });
    
    // Don't proceed if auth is still loading
    if (authLoading) {
      console.log('[ProfilePage] Auth still loading, waiting...');
      return;
    }

    // Don't proceed if no user
    if (!user) {
      console.log('[ProfilePage] No user found, stopping fetch');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      console.log(`[ProfilePage] Starting fetch for user ID: ${user.id}`);
      setLoading(true);

      try {
        // Test Supabase connection first
        console.log('[ProfilePage] Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1);
          
        if (testError) {
          console.error('[ProfilePage] Supabase connection test failed:', testError);
          throw new Error(`Database connection failed: ${testError.message}`);
        }
        console.log('[ProfilePage] Supabase connection successful');

        // 1. User profile
        console.log('[ProfilePage] Fetching user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('[ProfilePage] Profile error:', profileError);
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }
        
        console.log('[ProfilePage] Profile data:', profile);
        setUserProfile(profile);

        // 2. Restaurant profile
        console.log('[ProfilePage] Fetching restaurant data...');
        let { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, cuisine_type, city, state, country, phone, address, owner_name, auth_user_id')
          .eq('auth_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (restaurantError) {
          console.error('[ProfilePage] Restaurant error:', restaurantError);
          throw new Error(`Failed to fetch restaurant data: ${restaurantError.message}`);
        }

        console.log('[ProfilePage] Restaurant data:', restaurant);
        
        // If no restaurant row, create one
        if (!restaurant) {
          console.log('[ProfilePage] Creating new restaurant record...');
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
            .select()
            .single();

          if (insertError) {
            console.error('[ProfilePage] Restaurant creation error:', insertError);
            throw new Error(`Failed to create restaurant: ${insertError.message}`);
          }
          
          console.log('[ProfilePage] Restaurant created successfully');
          restaurant = newRestaurant;
        }

        setRestaurantData(restaurant);
        console.log('[ProfilePage] All data fetched successfully');
        
      } catch (err: any) {
        console.error('[ProfilePage] Fetch error:', err);
        setMessage({ type: 'error', text: err.message || 'Unknown error occurred' });
      } finally {
        console.log('[ProfilePage] Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, authLoading]);

  // 🔹 Save button handler
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      if (userProfile) {
        const { error: userError } = await supabase
          .from('user_profiles')
          .update({
            full_name: userProfile.full_name,
            subscription_type: userProfile.subscription_type,
          })
          .eq('id', user.id);

        if (userError) throw userError;
      }

      if (restaurantData) {
        const { error: restError } = await supabase
          .from('restaurants')
          .update({
            name: restaurantData.name,
            cuisine_type: restaurantData.cuisine_type,
            city: restaurantData.city,
            state: restaurantData.state,
            country: restaurantData.country,
            phone: restaurantData.phone,
            address: restaurantData.address,
            owner_name: restaurantData.owner_name,
          })
          .eq('id', restaurantData.id);

        if (restError) throw restError;
      }

      setMessage({ type: 'success', text: 'All changes saved successfully!' });
    } catch (err: any) {
      console.error('[ProfilePage] Save error:', err);
      setMessage({ type: 'error', text: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Debug render logic
  console.log('[ProfilePage] Render decision:', {
    authLoading,
    user: user ? 'exists' : 'null',
    loading,
    willShowAuthLoading: authLoading,
    willShowNoUser: !authLoading && !user,
    willShowDataLoading: !authLoading && user && loading,
    willShowMain: !authLoading && user && !loading
  });

  // Show loading state for auth
  if (authLoading) {
    console.log('[ProfilePage] Rendering: Auth loading state');
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-600">
            <div>Loading authentication...</div>
            <div className="text-sm mt-2">authLoading = {String(authLoading)}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if no user
  if (!user) {
    console.log('[ProfilePage] Rendering: No user state');
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-red-600">
            <div>Please log in to view your profile.</div>
            <div className="text-sm mt-2">authLoading = {String(authLoading)}, user = null</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading state for profile data
  if (loading) {
    console.log('[ProfilePage] Rendering: Data loading state');
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-600">
            <div>Loading your profile...</div>
            <div className="text-sm mt-2">User ID: {user.id}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  console.log('[ProfilePage] Rendering: Main form');

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile (Debug)</h1>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-gray-100 rounded text-sm">
          <strong>Debug Info:</strong><br/>
          authLoading: {String(authLoading)} ({typeof authLoading})<br/>
          user: {user ? `${user.id} (${user.email})` : 'null'}<br/>
          userProfile: {userProfile ? 'loaded' : 'not loaded'}<br/>
          restaurantData: {restaurantData ? 'loaded' : 'not loaded'}
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* User Profile */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold">User Information</h2>
          <input
            type="text"
            value={userProfile?.full_name || ''}
            onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
            placeholder="Full Name"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={userProfile?.subscription_type || ''}
            onChange={(e) => setUserProfile({ ...userProfile, subscription_type: e.target.value })}
            placeholder="Subscription Type"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Restaurant Profile */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Restaurant Information</h2>
          <input
            type="text"
            value={restaurantData?.name || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
            placeholder="Restaurant Name"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.cuisine_type || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, cuisine_type: e.target.value })}
            placeholder="Cuisine Type"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.owner_name || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, owner_name: e.target.value })}
            placeholder="Owner Name"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.phone || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, phone: e.target.value })}
            placeholder="Phone"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.address || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, address: e.target.value })}
            placeholder="Address"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.city || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, city: e.target.value })}
            placeholder="City"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.state || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, state: e.target.value })}
            placeholder="State"
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={restaurantData?.country || ''}
            onChange={(e) => setRestaurantData({ ...restaurantData, country: e.target.value })}
            placeholder="Country"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Save Button */}
        <div className="mt-8 text-right">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              saving ? 'bg-gray-400' : 'bg-coral-600 hover:bg-coral-700'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;