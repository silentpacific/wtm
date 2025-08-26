// src/pages/RestaurantLoginPage.tsx - Minimalist redesign
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
    <div className="min-h-screen bg-wtm-bg flex items-center justify-center py-16 px-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-8">
            <span className="text-3xl font-bold text-wtm-text tracking-tight">
              WhatThe<span className="text-wtm-primary">Menu</span>
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-wtm-text mb-4 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xl text-wtm-muted font-light">
            Sign in to your restaurant dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-medium">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
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
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
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
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-wtm-muted hover:text-wtm-text transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-wtm-primary focus:ring-wtm-primary border-gray-300 rounded"
                />
                <span className="ml-3 text-wtm-muted">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-200 ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-wtm-primary text-white hover:bg-wtm-primary-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <p className="text-wtm-muted mb-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-wtm-primary hover:text-wtm-primary-600 font-semibold transition-colors">
                Create one here
              </Link>
            </p>

            {/* Demo Link */}
            <p className="text-sm text-wtm-muted mb-3">
              Want to see how it works first?
            </p>
            <Link
              to="/demos"
              className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
            >
              Try Demo Restaurants
            </Link>
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

export default RestaurantLoginPage;