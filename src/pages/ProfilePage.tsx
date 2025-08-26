// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

const ProfilePage: React.FC = () => {
  const { user, authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // 🔹 Fetch profile + restaurant
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // 1. User profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        setUserProfile(profile);

        // 2. Restaurant profile
        let { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('id, name, cuisine_type, city, state, country, phone, address, owner_name, auth_user_id')
          .eq('auth_user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (restaurantError) throw restaurantError;

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
            .select()
            .single();

          if (insertError) throw insertError;
          restaurant = newRestaurant;
        }

        setRestaurantData(restaurant);
      } catch (err) {
        console.error('Get profile error:', err);
        setMessage({ type: 'error', text: 'Failed to load profile data' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

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
    } catch (err) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

	if (loading) {
	  return (
		<DashboardLayout>
		  <div className="text-center py-12 text-gray-600">Loading your profile...</div>
		</DashboardLayout>
	  );
	}

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

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
