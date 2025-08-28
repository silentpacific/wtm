// src/pages/DashboardPage.tsx - Handles users without restaurant profiles
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import DashboardLayout from '../components/DashboardLayout';
import { 
  Upload, 
  QrCode, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Building,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

// Onboarding component for users without restaurant profiles
const RestaurantOnboarding: React.FC = () => {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    address: '',
    city: '',
    phone: ''
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mexican', 
    'French', 'American', 'Mediterranean', 'Vietnamese', 'Korean', 
    'Greek', 'Spanish', 'Modern Australian', 'Cafe', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.restaurantName.trim()) {
      setError('Restaurant name is required');
      return;
    }
    
    if (!formData.cuisineType) {
      setError('Cuisine type is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create restaurant profile for existing user
      const { data, error } = await supabase
        .from('user_restaurant_profiles')
        .insert([
          {
            auth_user_id: user?.id,
            restaurant_name: formData.restaurantName,
            cuisine_type: formData.cuisineType,
            address: formData.address,
            city: formData.city,
            phone: formData.phone,
            email: user?.email
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh auth context to pick up new restaurant profile
      window.location.reload();

    } catch (error: any) {
      console.error('Profile creation error:', error);
      setError('Failed to create restaurant profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Restaurant Profile</h1>
          <p className="text-xl text-gray-600">Just a few details to get you started</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline w-4 h-4 mr-2" />
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your Restaurant Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type *
                </label>
                <select
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select cuisine type</option>
                  {cuisineOptions.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Adelaide"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="+61 8 1234 5678"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main dashboard component for users with complete profiles
const MainDashboard: React.FC = () => {
  const { restaurant } = useAuth();

  const stats = [
    {
      name: 'Menu Items',
      value: '24',
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'QR Scans',
      value: '156',
      icon: QrCode,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Active Users',
      value: '43',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      name: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const quickActions = [
    {
      name: 'Upload Menu',
      description: 'Scan and upload your latest menu',
      href: '/dashboard/menu-editor',
      icon: Upload,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Generate QR Code',
      description: 'Create QR codes for your tables',
      href: '/dashboard/qr-codes',
      icon: QrCode,
      color: 'bg-green-500 hover:bg-green-600'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {restaurant?.owner_name || 'Restaurant Owner'}!
        </h1>
        <p className="text-gray-600">
          {restaurant?.restaurant_name} Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`rounded-lg ${stat.bgColor} p-3`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start">
                <div className={`rounded-lg ${action.color} p-3 text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {action.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{action.description}</p>
                  <span className="inline-flex items-center text-orange-600 font-medium">
                    Get started <ArrowRight className="w-4 h-4 ml-2" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Menu updated successfully</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">New QR code generated for Table 5</p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Profile information updated</p>
                <p className="text-sm text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const { user, restaurant, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding for users without restaurant profile
  //   if (user && !restaurant) {
   //    return <RestaurantOnboarding />;
  //   }

  // Show main dashboard for users with complete profiles
  return (
    <DashboardLayout>
      <MainDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;