// src/pages/ProfilePage.tsx - Debug Version
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // Add debug logging
  const addDebug = (msg: string) => {
    console.log(`[ProfilePage Debug]: ${msg}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  // 🔹 Fetch profile + restaurant
  useEffect(() => {
    addDebug('useEffect triggered');
    addDebug(`authLoading: ${authLoading}, user: ${user ? 'exists' : 'null'}`);
    
    if (authLoading) {
      addDebug('Still loading auth, waiting...');
      return;
    }

    if (!user) {
      addDebug('No user found, stopping fetch');
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      addDebug(`Starting fetch for user ID: ${user.id}`);
      setLoading(true);

      try {
        // Test basic Supabase connection first
        addDebug('Testing Supabase connection...');
        const { data: testData, error: testError } = await supabase
          .from('user_profiles')
          .select('count')
          .limit(1);
          
        if (testError) {
          addDebug(`Supabase connection failed: ${testError.message}`);
          throw testError;
        }
        addDebug('Supabase connection successful');

        // 1. User profile
        addDebug('Fetching user profile...');
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          addDebug(`Profile error: ${profileError.message}`);
          throw profileError;
        }
        
        addDebug(`Profile data: ${profile ? 'found' : 'not found'}`);
        if (profile) {
          addDebug(`Profile keys: ${Object.keys(profile).join(', ')}`);
        }
        setUserProfile(profile);

        // 2. Restaurant profile
        addDebug('Fetching restaurant data...');
        let { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, cuisine_type, city, state, country, phone, address, owner_name, auth_user_id')
          .eq('auth_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (restaurantError) {
          addDebug(`Restaurant error: ${restaurantError.message}`);
          throw restaurantError;
        }

        addDebug(`Restaurant data: ${restaurant ? 'found' : 'not found'}`);
        
        // If no restaurant row, create one
        if (!restaurant) {
          addDebug('Creating new restaurant record...');
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
            addDebug(`Restaurant creation error: ${insertError.message}`);
            throw insertError;
          }
          
          addDebug('Restaurant created successfully');
          restaurant = newRestaurant;
        }

        setRestaurantData(restaurant);
        addDebug('All data fetched successfully');
        
      } catch (err: any) {
        addDebug(`Fetch error: ${err.message || err}`);
        console.error('Get profile error:', err);
        setMessage({ type: 'error', text: `Failed to load profile data: ${err.message}` });
      } finally {
        addDebug('Fetch completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, authLoading]);

  // 🔹 Save button handler (simplified for debugging)
  const handleSave = async () => {
    if (!user) {
      addDebug('No user for save operation');
      return;
    }
    
    addDebug('Starting save operation...');
    setSaving(true);
    setMessage(null);

    try {
      if (userProfile) {
        addDebug('Updating user profile...');
        const { error: userError } = await supabase
          .from('user_profiles')
          .update({
            full_name: userProfile.full_name,
            subscription_type: userProfile.subscription_type,
          })
          .eq('id', user.id);

        if (userError) {
          addDebug(`User update error: ${userError.message}`);
          throw userError;
        }
        addDebug('User profile updated');
      }

      if (restaurantData) {
        addDebug('Updating restaurant data...');
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

        if (restError) {
          addDebug(`Restaurant update error: ${restError.message}`);
          throw restError;
        }
        addDebug('Restaurant data updated');
      }

      addDebug('Save completed successfully');
      setMessage({ type: 'success', text: 'All changes saved successfully!' });
    } catch (err: any) {
      addDebug(`Save error: ${err.message || err}`);
      console.error('Save error:', err);
      setMessage({ type: 'error', text: `Failed to save changes: ${err.message}` });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Debug render conditions
  addDebug(`Render: authLoading=${authLoading}, loading=${loading}, user=${user ? 'exists' : 'null'}`);

  if (authLoading) {
    addDebug('Rendering: Auth loading...');
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div>Auth Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Checking authentication status</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    addDebug('Rendering: No user');
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-red-600">
          <div>No user found - please log in</div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    addDebug('Rendering: Data loading...');
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div>Loading your profile...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching profile data from database</div>
        </div>
      </DashboardLayout>
    );
  }

  addDebug('Rendering: Main profile form');

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile (Debug Mode)</h1>

        {/* Debug Info Panel */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <div className="text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
          <div className="mt-2 text-sm">
            <strong>Current State:</strong>
            <div>User ID: {user?.id}</div>
            <div>User Profile: {userProfile ? 'Loaded' : 'Not loaded'}</div>
            <div>Restaurant Data: {restaurantData ? 'Loaded' : 'Not loaded'}</div>
          </div>
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

        {/* Manual Debug Triggers */}
        <div className="mt-8 p-4 border-t border-gray-200">
          <h3 className="font-semibold mb-2">Debug Actions:</h3>
          <div className="space-x-2">
            <button
              onClick={() => {
                addDebug('Manual auth check triggered');
                addDebug(`Auth state: ${JSON.stringify({ user: user?.id, authLoading })}`);
              }}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              Check Auth State
            </button>
            <button
              onClick={async () => {
                addDebug('Manual Supabase test triggered');
                try {
                  const { data, error } = await supabase.auth.getUser();
                  addDebug(`Supabase auth check: ${data.user ? 'User found' : 'No user'}`);
                  if (error) addDebug(`Supabase auth error: ${error.message}`);
                } catch (e: any) {
                  addDebug(`Supabase test failed: ${e.message}`);
                }
              }}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded"
            >
              Test Supabase
            </button>
            <button
              onClick={() => setDebugInfo([])}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded"
            >
              Clear Debug Log
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;