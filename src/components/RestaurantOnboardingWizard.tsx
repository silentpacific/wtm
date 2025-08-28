// src/components/RestaurantOnboardingWizard.tsx - Resumable onboarding with progress saving
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Building, MapPin, Phone, Mail, Lock, 
  Eye, EyeOff, Check, ArrowRight, ArrowLeft,
  QrCode, Upload, Sparkles, CheckCircle,
  Loader, AlertCircle, ExternalLink, FileText, FileImage
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface OnboardingState {
  email: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  city: string;
  state: string;
  country: string;
  ownerName: string;
  phone: string;
  address: string;
  cuisineType: string;
  urlSlug: string;
  qrGenerated: boolean;
  menuUploaded: boolean;
  menuId: string | null;
  dietaryAnalysisComplete: boolean;
}

interface OnboardingProgress {
  current_step: number;
  step_1_complete: boolean;
  step_2_complete: boolean;
  step_3_complete: boolean;
  step_4_complete: boolean;
  step_5_complete: boolean;
  form_data: any;
}

const RestaurantOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [isResuming, setIsResuming] = useState(true);
  
  const [formData, setFormData] = useState<OnboardingState>({
    email: '',
    password: '',
    confirmPassword: '',
    restaurantName: '',
    city: '',
    state: '',
    country: 'Australia',
    ownerName: '',
    phone: '',
    address: '',
    cuisineType: '',
    urlSlug: '',
    qrGenerated: false,
    menuUploaded: false,
    menuId: null,
    dietaryAnalysisComplete: false
  });

  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mexican', 
    'French', 'American', 'Mediterranean', 'Vietnamese', 'Korean', 
    'Greek', 'Spanish', 'Modern Australian', 'Cafe', 'Other'
  ];

  // Check for existing progress on mount
  useEffect(() => {
    checkExistingProgress();
  }, []);

  // Generate URL slug when restaurant name and city change
  useEffect(() => {
    if (formData.restaurantName && formData.city) {
      const slug = generateUrlSlug(formData.restaurantName, formData.city);
      setFormData(prev => ({ ...prev, urlSlug: slug }));
    }
  }, [formData.restaurantName, formData.city]);

  const checkExistingProgress = async () => {
    setIsResuming(true);
    try {
      // Check if user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await loadExistingProgress(session.user.id);
      }
    } catch (error) {
      console.error('Error checking progress:', error);
    } finally {
      setIsResuming(false);
    }
  };

  const loadExistingProgress = async (userId: string) => {
    try {
      // Check user_restaurant_profiles for existing data
      const { data: profile } = await supabase
        .from('user_restaurant_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profile) {
        // Restore form data from database
        setFormData(prev => ({
          ...prev,
          email: profile.email || '',
          restaurantName: profile.restaurant_name || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || 'Australia',
          ownerName: profile.owner_name || '',
          phone: profile.phone || '',
          address: profile.address || '',
          cuisineType: profile.cuisine_type || '',
          urlSlug: profile.url_slug || ''
        }));

        // Determine current step based on completed data
        if (profile.restaurant_name && profile.city && profile.url_slug) {
          if (profile.url_slug) {
            setCurrentStep(3); // Has restaurant profile, go to QR step
          } else {
            setCurrentStep(2); // Has basic info, continue with profile
          }
        }
      }

      // Check for existing menus
      const { data: menus } = await supabase
        .from('menus')
        .select('id, status')
        .eq('restaurant_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (menus && menus.length > 0) {
        setFormData(prev => ({
          ...prev,
          menuUploaded: true,
          menuId: menus[0].id,
          dietaryAnalysisComplete: menus[0].status === 'active'
        }));
        
        if (menus[0].status === 'active') {
          // All complete, redirect to dashboard
          navigate('/dashboard');
        } else {
          setCurrentStep(5); // Go to dietary analysis step
        }
      }

    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (stepData: Partial<OnboardingState>, stepNumber: number) => {
    if (!user) return;

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Map form data to database fields
      if (stepData.ownerName) updateData.owner_name = stepData.ownerName;
      if (stepData.email) updateData.email = stepData.email;
      if (stepData.restaurantName) updateData.restaurant_name = stepData.restaurantName;
      if (stepData.city) updateData.city = stepData.city;
      if (stepData.state) updateData.state = stepData.state;
      if (stepData.country) updateData.country = stepData.country;
      if (stepData.phone) updateData.phone = stepData.phone;
      if (stepData.address) updateData.address = stepData.address;
      if (stepData.cuisineType) updateData.cuisine_type = stepData.cuisineType;
      if (stepData.urlSlug) updateData.url_slug = stepData.urlSlug;

      const { error } = await supabase
        .from('user_restaurant_profiles')
        .upsert({
          id: user.id,
          auth_user_id: user.id,
          ...updateData
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Save progress error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save progress:', error);
      throw error;
    }
  };

  const generateUrlSlug = (restaurantName: string, city: string): string => {
    const combined = `${restaurantName}-${city}`;
    return combined
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
  };

  const validateStep1 = () => {
    if (!formData.email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Email is invalid';
    if (!formData.ownerName.trim()) return 'Owner name is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.restaurantName.trim()) return 'Restaurant name is required';
    if (!formData.city.trim()) return 'City is required';
    if (!formData.cuisineType) return 'Cuisine type is required';
    if (!formData.phone.trim()) return 'Phone number is required';
    if (!formData.address.trim()) return 'Address is required';
    return null;
  };

  const handleStep1Submit = async () => {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.ownerName
          }
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Failed to create account');

      setUser(authData.user);

      // Create initial profile record
      const { error: profileError } = await supabase
        .from('user_restaurant_profiles')
        .insert({
          id: authData.user.id,
          auth_user_id: authData.user.id,
          full_name: formData.ownerName,
          email: formData.email,
          subscription_type: 'free'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the step, just log the error - we can create it in step 2
      }

      setCurrentStep(2);
      
    } catch (err: any) {
      console.error('Step 1 error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    const validationError = validateStep2();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!user) {
      setError('Authentication error. Please refresh and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if URL slug is unique
      let finalSlug = formData.urlSlug;
      const { data: existingRestaurant } = await supabase
        .from('user_restaurant_profiles')
        .select('id')
        .eq('url_slug', finalSlug)
        .neq('id', user.id) // Exclude current user
        .maybeSingle();

      if (existingRestaurant) {
        let counter = 1;
        while (true) {
          const testSlug = `${formData.urlSlug}-${counter}`;
          const { data: existing } = await supabase
            .from('user_restaurant_profiles')
            .select('id')
            .eq('url_slug', testSlug)
            .neq('id', user.id)
            .maybeSingle();
            
          if (!existing) {
            finalSlug = testSlug;
            break;
          }
          counter++;
        }
      }

      // Save restaurant profile progress
      await saveProgress({
        restaurantName: formData.restaurantName,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        phone: formData.phone,
        address: formData.address,
        cuisineType: formData.cuisineType,
        urlSlug: finalSlug
      }, 2);

      setFormData(prev => ({ ...prev, urlSlug: finalSlug }));
      setCurrentStep(3);
      
    } catch (err: any) {
      console.error('Step 2 error:', err);
      setError(err.message || 'Failed to save restaurant information');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = async (size: number, format: string = 'png') => {
    const menuUrl = `${window.location.origin}/r/${formData.urlSlug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(menuUrl)}`;
    
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.restaurantName.toLowerCase().replace(/\s+/g, '-')}-qr-${size}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleMenuUpload = async () => {
    if (!menuFile || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const base64Data = await convertFileToBase64(menuFile);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/.netlify/functions/menu-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          fileData: base64Data,
          fileName: menuFile.name,
          mimeType: menuFile.type
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      // Save menu progress
      setFormData(prev => ({ 
        ...prev, 
        menuUploaded: true, 
        menuId: result.menuId 
      }));
      
      setCurrentStep(5);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload menu');
    } finally {
      setIsLoading(false);
    }
  };

  const runDietaryAnalysis = async () => {
    if (!formData.menuId) return;
    
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/.netlify/functions/dietary-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          menuId: formData.menuId 
        })
      });

      if (!response.ok) {
        throw new Error('Dietary analysis function not available');
      }

      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({ ...prev, dietaryAnalysisComplete: true }));
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        throw new Error(result.error || 'Dietary analysis failed');
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze menu');
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const steps = [
    { number: 1, title: 'Create Account', completed: currentStep > 1 || (user && formData.email) },
    { number: 2, title: 'Restaurant Profile', completed: currentStep > 2 || (formData.restaurantName && formData.urlSlug) },
    { number: 3, title: 'QR Code Setup', completed: currentStep > 3 },
    { number: 4, title: 'Menu Upload', completed: currentStep > 4 || formData.menuUploaded },
    { number: 5, title: 'Dietary Analysis', completed: formData.dietaryAnalysisComplete }
  ];

  const menuUrl = `${window.location.origin}/r/${formData.urlSlug}`;

  if (isResuming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              WhatThe<span className="text-orange-500">Menu</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {user ? 'Continue Setting Up Your Restaurant' : 'Let\'s Get Your Restaurant Online'}
          </h1>
          <p className="text-xl text-gray-600">
            5 quick steps to make your menu accessible to all customers
          </p>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step.completed 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.number
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.completed ? <Check size={16} /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </h2>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          
          {/* Step 1: Create Account */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Create Your Account</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Mail className="inline mr-2" size={20} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="your.email@restaurant.com"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <User className="inline mr-2" size={20} />
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="Your Full Name"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Lock className="inline mr-2" size={20} />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={handleStep1Submit}
                  disabled={isLoading}
                  className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Creating Account...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Restaurant Profile */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Restaurant Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Building className="inline mr-2" size={20} />
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="Your Restaurant Name"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <MapPin className="inline mr-2" size={20} />
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="Adelaide"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    Cuisine Type
                  </label>
                  <select
                    value={formData.cuisineType}
                    onChange={(e) => setFormData(prev => ({ ...prev, cuisineType: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineOptions.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>

                {formData.urlSlug && (
                  <div className="md:col-span-2">
                    <label className="block text-lg font-medium text-gray-900 mb-3">
                      Your Menu URL (automatically generated)
                    </label>
                    <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg text-gray-600 font-mono">
                      whatthemenu.com/r/{formData.urlSlug}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      This URL will be used for your QR codes and cannot be changed later
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    <Phone className="inline mr-2" size={20} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="+61 8 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="South Australia"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-gray-900 mb-3">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 focus:outline-none text-lg"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={handleStep2Submit}
                  disabled={isLoading}
                  className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: QR Code Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Your QR Code is Ready!</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-center p-6 bg-gray-50 rounded-2xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(menuUrl)}`}
                      alt="QR Code Preview"
                      className="w-48 h-48 mx-auto rounded-xl shadow-sm"
                    />
                    <p className="mt-4 text-sm text-gray-500 font-mono break-all">{menuUrl}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Download QR Codes</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => downloadQRCode(400)}
                      className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="font-medium">Small (400×400)</div>
                      <div className="text-sm text-gray-500">Perfect for table tents</div>
                    </button>
                    <button
                      onClick={() => downloadQRCode(800)}
                      className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="font-medium">Large (800×800)</div>
                      <div className="text-sm text-gray-500">For posters and displays</div>
                    </button>
                    <button
                      onClick={() => downloadQRCode(1200)}
                      className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="font-medium">Jumbo (1200×1200)</div>
                      <div className="text-sm text-gray-500">Professional printing</div>
                    </button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <h5 className="font-medium text-blue-800 mb-2">Usage Tips:</h5>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Place QR codes near your entrance</li>
                      <li>• Include "Scan for Menu" text</li>
                      <li>• Ensure good lighting for scanning</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200"
                  >
                    Skip Menu Upload
                  </button>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 flex items-center"
                  >
                    <ArrowRight className="w-5 h-5 mr-2" />
                    Continue to Menu Upload
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Menu Upload */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Upload Your Menu</h3>
              
              {!menuFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                  <input
                    type="file"
                    id="menu-upload"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setMenuFile(file);
                    }}
                    className="hidden"
                  />
                  <label htmlFor="menu-upload" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Upload Your Menu
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Drag and drop your menu image or PDF, or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG, and PDF files up to 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center">
                      {menuFile.type === 'application/pdf' ? (
                        <FileText className="w-8 h-8 text-orange-500 mr-3" />
                      ) : (
                        <FileImage className="w-8 h-8 text-orange-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{menuFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(menuFile.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setMenuFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>

                  <button
                    onClick={handleMenuUpload}
                    disabled={isLoading}
                    className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Processing Menu...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Process Menu
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={isLoading}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  disabled={isLoading}
                  className="bg-gray-100 text-gray-700 px-6 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 disabled:opacity-50"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Dietary Analysis */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Final Step: Dietary Analysis</h3>
              
              {!formData.dietaryAnalysisComplete ? (
                <div className="text-center space-y-6">
                  <div className="p-8 bg-blue-50 rounded-2xl">
                    <Sparkles className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-blue-800 mb-4">
                      Ready to Analyze Your Menu
                    </h4>
                    <p className="text-blue-700 mb-6">
                      Our AI will automatically identify allergens (nuts, dairy, gluten, etc.) 
                      and dietary tags (vegetarian, vegan, gluten-free) for all your dishes.
                    </p>
                    <p className="text-sm text-blue-600 mb-6">
                      This usually takes 10-60 seconds depending on menu size.
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200"
                      >
                        Skip for Now
                      </button>
                      <button
                        onClick={runDietaryAnalysis}
                        disabled={isLoading}
                        className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isLoading ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing Menu...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Start Analysis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="p-8 bg-green-50 rounded-2xl">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-green-800 mb-4">
                      Setup Complete!
                    </h4>
                    <p className="text-green-700 mb-6">
                      Your restaurant is now live and accessible to customers. 
                      They can scan your QR codes to view your menu in multiple languages 
                      with full dietary information.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a
                        href={menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        View Live Menu
                      </a>
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center text-gray-500">
                    <p>Redirecting to dashboard in a few seconds...</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={isLoading || formData.dietaryAnalysisComplete}
                  className="bg-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RestaurantOnboardingWizard;