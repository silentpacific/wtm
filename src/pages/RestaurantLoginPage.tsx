// src/pages/RestaurantLoginPage.tsx - Updated with new design system
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      await signIn({
        email: formData.email,
        password: formData.password
      });
      
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error.message.includes('email')) {
        setErrors({ general: 'Please check your email address and try again.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-wtm-text font-heading">
              WhatThe<span className="text-wtm-primary">Menu</span>
            </span>
          </Link>
          <h1 className="heading-secondary text-wtm-text mb-2">
            Welcome Back
          </h1>
          <p className="text-wtm-muted">
            Sign in to your restaurant dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-wtm-text mb-2">
                <Mail className="inline mr-1" size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field ${
                  errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder="your.email@restaurant.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-wtm-text mb-2">
                <Lock className="inline mr-1" size={16} />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`input-field pr-12 ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-wtm-muted hover:text-wtm-text focus-ring rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-wtm-primary focus:ring-wtm-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-wtm-muted">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-wtm-primary hover:text-wtm-primary-600 focus-ring rounded px-1"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`btn w-full py-4 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'btn-primary'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-wtm-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-wtm-primary hover:text-wtm-primary-600 font-semibold focus-ring rounded px-1">
                Create one here
              </Link>
            </p>
          </div>

          {/* Demo Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-wtm-muted mb-2">
              Want to see how it works first?
            </p>
            <Link
              to="/demos"
              className="text-wtm-primary hover:text-wtm-primary-600 text-sm font-medium focus-ring rounded px-1"
            >
              View Demo Restaurants
            </Link>
          </div>
        </div>

        {/* Support Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-6 text-sm text-wtm-muted">
            <Link to="/faq" className="hover:text-wtm-text focus-ring rounded px-1">Help</Link>
            <Link to="/contact" className="hover:text-wtm-text focus-ring rounded px-1">Contact</Link>
            <Link to="/privacy" className="hover:text-wtm-text focus-ring rounded px-1">Privacy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLoginPage;