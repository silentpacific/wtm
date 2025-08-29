// src/pages/RestaurantLoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const RestaurantLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Logged in:', data);
        navigate('/'); // stay on home, you can type URLs later
      }
    } catch (err: any) {
      console.error('💥 Unexpected login error:', err);
      setError('Unexpected error. Please try again.');
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
            Sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Email */}
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
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none text-lg"
                placeholder="your.email@restaurant.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
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
                  className="w-full px-5 py-4 pr-14 border border-gray-200 rounded-2xl focus:border-wtm-primary focus:ring-2 focus:ring-wtm-primary/20 focus:outline-none text-lg"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-wtm-muted hover:text-wtm-text"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 rounded-2xl font-semibold text-lg flex items-center justify-center ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-wtm-primary text-white hover:bg-wtm-primary-600 hover:scale-[1.02] shadow-lg'
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

          {/* Forgot password (optional) */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              to="/forgot-password" 
              className="text-wtm-muted hover:text-wtm-text"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLoginPage;
