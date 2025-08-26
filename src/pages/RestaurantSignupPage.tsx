// src/pages/RestaurantSignupPage.tsx - Restaurant Owner Registration
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone, MapPin, User, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    // Restaurant Info
    restaurantName: '',
    cuisineType: '',
    address: '',
    city: '',
    phone: '',
    
    // Owner Info
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Restaurant validation
    if (!formData.restaurantName.trim()) newErrors.restaurantName = 'Restaurant name is required';
    if (!formData.cuisineType) newErrors.cuisineType = 'Cuisine type is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    // Owner validation
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
      await signUp({
        email: formData.email,
        password: formData.password,
        restaurantName: formData.restaurantName,
        ownerName: formData.ownerName,
        cuisineType: formData.cuisineType,
        phone: formData.phone,
        address: formData.address,
        city: formData.city
      });
      
      // Success - redirect to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error types
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
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--wtm-bg)' }}>
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
              WhatThe<span style={{ color: 'var(--wtm-primary)' }}>Menu</span>
            </span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--wtm-text)' }}>
            Sign Up Your Restaurant
          </h1>
          <p style={{ color: 'var(--wtm-muted)' }}>
            Make your restaurant accessible to all customers
          </p>
        </div>

        {/* Signup Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="p-4 rounded-lg" 
                   style={{ 
                     backgroundColor: '#FCEDEA', 
                     border: '1px solid #F87171',
                     color: '#7A2E21'
                   }}>
                <p className="text-sm">{errors.general}</p>
              </div>
            )}

            {/* Restaurant Information */}
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <Building className="mr-2" size={20} />
                Restaurant Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.restaurantName ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., Mario's Italian Kitchen"
                  />
                  {errors.restaurantName && (
                    <p className="text-red-600 text-sm mt-1">{errors.restaurantName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    Cuisine Type
                  </label>
                  <select
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.cuisineType ? 'border-red-300' : ''
                    }`}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineOptions.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {errors.cuisineType && (
                    <p className="text-red-600 text-sm mt-1">{errors.cuisineType}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    <MapPin className="inline mr-1" size={16} />
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.address ? 'border-red-300' : ''
                    }`}
                    placeholder="123 Main Street"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.city ? 'border-red-300' : ''
                    }`}
                    placeholder="Adelaide"
                  />
                  {errors.city && (
                    <p className="text-red-600 text-sm mt-1">{errors.city}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" 
                       style={{ color: 'var(--wtm-text)' }}>
                  <Phone className="inline mr-1" size={16} />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`input-field w-full ${
                    errors.phone ? 'border-red-300' : ''
                  }`}
                  placeholder="+61 8 1234 5678"
                />
                {errors.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Owner Information */}
            <div className="border-t pt-6" style={{ borderColor: '#EFE7E2' }}>
              <h2 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <User className="mr-2" size={20} />
                Owner Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.ownerName ? 'border-red-300' : ''
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.ownerName && (
                    <p className="text-red-600 text-sm mt-1">{errors.ownerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    <Mail className="inline mr-1" size={16} />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-field w-full ${
                      errors.email ? 'border-red-300' : ''
                    }`}
                    placeholder="john@restaurant.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`input-field w-full pr-12 ${
                        errors.password ? 'border-red-300' : ''
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--wtm-muted)' }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" 
                         style={{ color: 'var(--wtm-text)' }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`input-field w-full pr-12 ${
                        errors.confirmPassword ? 'border-red-300' : ''
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--wtm-muted)' }}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Subm