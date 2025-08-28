// src/components/RestaurantSignup.tsx - Single comprehensive signup form
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Building, MapPin, Phone, Mail, Lock, 
  Eye, EyeOff, Loader, AlertCircle, CheckCircle,
  QrCode, ExternalLink
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface FormData {
  // Account Info
  email: string;
  password: string;
  confirmPassword: string;
  
  // Restaurant Info
  restaurantName: string;
  ownerName: string;
  cuisineType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

const RestaurantSignup: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    ownerName: '',
    cuisineType: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Australia'
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mexican', 
    'French', 'American', 'Mediterranean', 'Vietnamese', 'Korean', 
    'Greek', 'Spanish', 'Modern Australian', 'Cafe', 'Other'
  ];

  // Generate URL slug preview
  useEffect(() => {
    if (formData.restaurantName && formData.city) {
      const slug = generateUrlSlug(formData.restaurantName, formData.city);
      setGeneratedSlug(slug);
    } else {
      setGeneratedSlug('');
    }
  }, [formData.restaurantName, formData.city]);

  const generateUrlSlug = (restaurantName: string, city: string): string => {
    const combined = `${restaurantName}-${city}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  const validateForm = () => {
    // Account validation
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    
    // Restaurant validation
    if (!formData.restaurantName.trim()) return 'Restaurant name is required';
    if (!formData.ownerName.trim()) return 'Owner name is required';
    if (!formData.cuisineType) return 'Cuisine type is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.address.trim()) return 'Address is required';
    if (!formData.city.trim()) return 'City is required';
    
    return null;
  };

  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    let finalSlug = baseSlug;
    let counter = 0;
    
    while (true) {
      const testSlug = counter === 0 ? baseSlug : `${baseSlug}-${counter}`;
      
      const { data: existing } = await supabase
        .from('user_restaurant_profiles')
        .select('id')
        .eq('url_slug', testSlug)
        .maybeSingle();
        
      if (!existing) {
        finalSlug = testSlug;
        break;
      }
      counter++;
    }
    
    return finalSlug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.ownerName
          }
        }
      });

      if (authError) {
        if (authError.message.includes('rate limit') || authError.message.includes('429')) {
          throw new Error('Too many signup attempts. Please wait a few minutes and try again.');
        }
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please use the login page instead.');
        }
        throw new Error(authError.message);
      }
      
      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // Step 2: Generate unique URL slug
      const baseSlug = generateUrlSlug(formData.restaurantName, formData.city);
      const uniqueSlug = await ensureUniqueSlug(baseSlug);

      // Step 3: Create restaurant profile
      const profileData = {
        id: authData.user.id,
        auth_user_id: authData.user.id,
        full_name: formData.ownerName,
        email: formData.email,
        restaurant_name: formData.restaurantName,
        cuisine_type: formData.cuisineType,
        owner_name: formData.ownerName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        url_slug: uniqueSlug,
        subscription_type: 'free'
      };

      const { error: profileError } = await supabase
        .from('user_restaurant_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create restaurant profile. Please try again.');
      }

      setGeneratedSlug(uniqueSlug);
      setIsComplete(true);
      
    } catch (err: any) {
      console.error('Signup error:', err);
      
      let errorMessage = err.message || 'Failed to create account';
      
      if (errorMessage.includes('rate limit')) {
        errorMessage = 'Too many signup attempts. Please wait 10-15 minutes before trying again.';
      } else if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use the login page instead.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const downloadQRCode = async (size: number) => {
    const menuUrl = `${window.location.origin}/r/${generatedSlug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.restaurantName.toLowerCase().replace(/\s+/g, '-')}-qr-${size}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Success screen after completion
  if (isComplete) {
    const menuUrl = `${window.location.origin}/r/${generatedSlug}`;
    
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-3xl font-bold text-gray-900 tracking-tight">
                WhatThe<span className="text-orange-500">Menu</span>
              </span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to WhatTheMenu!
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Your restaurant <strong>{formData.restaurantName}</strong> is now set up and ready to go.
            </p>

            {/* Restaurant URL */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Menu URL</h3>
              <div className="font-mono text-gray-700 bg-white p-3 rounded-xl border">
                {menuUrl}
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your QR Code</h3>
              <div className="inline-block p-4 bg-gray-50 rounded-2xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
                  alt="Restaurant QR Code"
                  className="w-48 h-48 rounded-xl"
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => downloadQRCode(400)}
                  className="mx-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Download Small (400×400)
                </button>
                <button
                  onClick={() => downloadQRCode(800)}
                  className="mx-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Download Large (800×800)
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  View Your Menu
                </a>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
              
              <p className="text-sm text-gray-500">
                You can upload your menu and add dietary information in the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main signup form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              WhatThe<span className="text-orange-500">Menu</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Get Your Restaurant Online
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Create accessible menus for all customers in minutes
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                Account Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Mail className="inline mr-2" size={20} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="your.email@restaurant.com"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <User className="inline mr-2" size={20} />
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="Your Full Name"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      <Lock className="inline mr-2" size={20} />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Information */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 tracking-tight">
                Restaurant Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Building className="inline mr-2" size={20} />
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="Your Restaurant Name"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      <MapPin className="inline mr-2" size={20} />
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      placeholder="Adelaide"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      Cuisine Type
                    </label>
                    <select
                      name="cuisineType"
                      value={formData.cuisineType}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      disabled={isLoading}
                    >
                      <option value="">Select cuisine type</option>
                      {cuisineOptions.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* URL Preview */}
                {generatedSlug && (
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      Your Menu URL (automatically generated)
                    </label>
                    <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg text-gray-600 font-mono">
                      whatthemenu.com/r/{generatedSlug}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Customers will scan a QR code to access this URL
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      <Phone className="inline mr-2" size={20} />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      placeholder="+61 8 1234 5678"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      placeholder="South Australia"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="123 Main Street"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Creating Your Restaurant...
                  </>
                ) : (
                  'Create Restaurant Account'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignup;