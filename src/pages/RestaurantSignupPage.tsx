// src/pages/RestaurantSignupPage.tsx - Removed manual navigation
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, MapPin, User, Building, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantSignupPage: React.FC = () => {
  const { signUp, user, authLoading } = useAuth();
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisineType: '',
    address: '',
    city: '',
    phone: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Don't render if user is already logged in - let App.tsx routing handle it
  if (user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const cuisineOptions = [
    'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai', 'Mexican', 
    'French', 'American', 'Mediterranean', 'Vietnamese', 'Korean', 
    'Greek', 'Spanish', 'Modern Australian', 'Cafe', 'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.restaurantName.trim()) newErrors.restaurantName = 'Restaurant name is required';
    if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Debug logs go here 👇
      console.log("Raw email:", formData.email);
      console.log("Normalized email:", JSON.stringify(formData.email.trim().toLowerCase()));

      const cleanEmail = formData.email.replace(/['"]+/g, '').trim().toLowerCase();

      await signUp({
        email: cleanEmail,
        password: formData.password,
        restaurantName: formData.restaurantName,
        ownerName: formData.ownerName,
        cuisineType: formData.cuisineType,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
      });

      // DO NOT NAVIGATE HERE - Let the App.tsx routing handle it automatically
    } catch (error: any) {
      console.error('Signup error:', error);

      if (error.message.includes('email')) {
        setErrors({ email: 'This email is already registered' });
      } else if (error.message.includes('password')) {
        setErrors({ password: error.message });
      } else {
        setErrors({ general: error.message || 'Failed to create account. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wtm-bg py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8">
            <span className="text-3xl font-bold text-wtm-text tracking-tight">
              WhatThe<span className="text-wtm-primary">Menu</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-wtm-text mb-4 tracking-tight">
            Start Your Journey
          </h1>
          <p className="text-xl text-wtm-muted font-light">
            Make your restaurant accessible to all customers
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-medium">{errors.general}</p>
              </div>
            )}
            
            {/* Restaurant Information */}
            <div>
              <h3 className="text-2xl font-semibold text-wtm-text mb-6 tracking-tight">
                Restaurant Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <Building className="inline mr-2" size={20} />
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.restaurantName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Your Restaurant Name"
                    disabled={isLoading}
                  />
                  {errors.restaurantName && <p className="text-red-600 text-sm mt-2">{errors.restaurantName}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    Cuisine Type
                  </label>
                  <select
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.cuisineType ? 'border-red-300' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineOptions.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {errors.cuisineType && <p className="text-red-600 text-sm mt-2">{errors.cuisineType}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <MapPin className="inline mr-2" size={20} />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.address ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="123 Main Street"
                    disabled={isLoading}
                  />
                  {errors.address && <p className="text-red-600 text-sm mt-2">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.city ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Adelaide"
                    disabled={isLoading}
                  />
                  {errors.city && <p className="text-red-600 text-sm mt-2">{errors.city}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <Phone className="inline mr-2" size={20} />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.phone ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="+61 8 1234 5678"
                    disabled={isLoading}
                  />
                  {errors.phone && <p className="text-red-600 text-sm mt-2">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div>
              <h3 className="text-2xl font-semibold text-wtm-text mb-6 tracking-tight">
                Owner Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <User className="inline mr-2" size={20} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.ownerName ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Your Full Name"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                  {errors.ownerName && <p className="text-red-600 text-sm mt-2">{errors.ownerName}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <Mail className="inline mr-2" size={20} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="your.email@restaurant.com"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-600 text-sm mt-2">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    <Lock className="inline mr-2" size={20} />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 pr-14 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-wtm-muted hover:text-wtm-text transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-600 text-sm mt-2">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-lg font-medium text-wtm-text mb-3">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full px-5 py-4 pr-14 border rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
                      }`}
                      placeholder="••••••••"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-wtm-muted hover:text-wtm-text transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-600 text-sm mt-2">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-wtm-primary text-white hover:bg-wtm-primary-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Start Free Trial'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-wtm-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-wtm-primary hover:text-wtm-primary-600 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-8 text-wtm-muted">
            <Link to="/faq" className="hover:text-wtm-text transition-colors">Help</Link>
            <Link to="/contact" className="hover:text-wtm-text transition-colors">Contact</Link>
            <Link to="/privacy" className="hover:text-wtm-text transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignupPage;