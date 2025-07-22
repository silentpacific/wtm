import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  subscription_type: string;
  scans_used: number;
  scans_limit: number;
  current_menu_dish_explanations: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  amount: number;
  currency: string;
  status: string;
  plan_type: string;
  created_at: string;
}

const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
      }

      // Load user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
      } else {
        setOrders(ordersData || []);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const profileData = {
        id: user?.id,
        email: user?.email,
        full_name: fullName.trim() || null,
        updated_at: new Date().toISOString()
      };

      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update(profileData)
          .eq('id', user?.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            ...profileData,
            subscription_type: 'free',
            scans_used: 0,
            scans_limit: 5,
            current_menu_dish_explanations: 0,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setMessage('Profile updated successfully!');
      loadUserData(); // Reload to get updated data
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100); // Stripe amounts are in cents
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-black text-charcoal mb-4">Please sign in to view your profile</h1>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-charcoal font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-charcoal">My Profile</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-charcoal text-cream font-bold rounded-lg hover:bg-charcoal/90 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl p-6 border-4 border-charcoal shadow-[8px_8px_0px_#292524]">
            <h2 className="text-2xl font-black text-charcoal mb-6">Profile Information</h2>
            
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full p-3 border-2 border-charcoal/30 rounded-lg bg-gray-50 font-medium text-charcoal/70"
                />
                <p className="text-xs text-charcoal/60 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-charcoal mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Profile'
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
          </div>

          {/* Account Stats */}
          <div className="bg-white rounded-2xl p-6 border-4 border-charcoal shadow-[8px_8px_0px_#292524]">
            <h2 className="text-2xl font-black text-charcoal mb-6">Account Stats</h2>
            
            {profile && (
              <div className="space-y-4">
                <div className="p-4 bg-yellow/20 rounded-lg border border-yellow/40">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal">Subscription</span>
                    <span className="font-black text-lg capitalize">{profile.subscription_type}</span>
                  </div>
                </div>

                <div className="p-4 bg-coral/20 rounded-lg border border-coral/40">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal">Scans Used</span>
                    <span className="font-black text-lg">{profile.scans_used} / {profile.scans_limit}</span>
                  </div>
                </div>

                <div className="p-4 bg-green-100 rounded-lg border border-green-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal">Dish Explanations</span>
                    <span className="font-black text-lg">{profile.current_menu_dish_explanations}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-100 rounded-lg border border-blue-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-charcoal">Member Since</span>
                    <span className="font-medium text-sm">{formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order History */}
        <div className="mt-8 bg-white rounded-2xl p-6 border-4 border-charcoal shadow-[8px_8px_0px_#292524]">
          <h2 className="text-2xl font-black text-charcoal mb-6">Order History</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-charcoal mb-2">No orders yet</h3>
              <p className="text-charcoal/70">Your order history will appear here when you make purchases.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="p-4 border-2 border-charcoal/20 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-charcoal capitalize">
                        {order.plan_type} Plan
                      </div>
                      <div className="text-sm text-charcoal/70">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-lg">
                        {formatAmount(order.amount, order.currency)}
                      </div>
                      <div className={`text-sm font-bold ${
                        order.status === 'completed' ? 'text-green-600' : 
                        order.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;