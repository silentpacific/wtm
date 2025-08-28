// src/pages/RestaurantLoginPage.tsx - Updated for new onboarding flow
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(formData.email, formData.password);
      // Navigation will be handled by auth state change in AuthContext
      // User will be redirected to dashboard if they have a restaurant profile
      // or to onboarding if they don't
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link');
      } else {
        setError(error.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wtm-bg py-16 px-6">
      <div className="max-w-md mx-auto">
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
            Sign in to manage your restaurant
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
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
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg"
                placeholder="your.email@restaurant.com"
                disabled={isLoading}
              />
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
                  className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl bg-white focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none transition-all duration-200 text-lg"
                  placeholder="••••••••"
                  disabled={isLoading}
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
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-wtm-primary text-white hover:bg-wtm-primary-600 hover:scale-[1.02] shadow-lg hover:shadow-xl'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Forgot Password */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              to="/forgot-password" 
              className="text-wtm-muted hover:text-wtm-text transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-wtm-muted">
              Don't have an account?{' '}
              <Link to="/signup" className="text-wtm-primary hover:text-wtm-primary-600 font-semibold transition-colors">
                Start your free trial
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

export default RestaurantLoginPage;