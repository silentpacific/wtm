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
            {/* ... same as before ... */}

            {/* Owner Information */}
            {/* ... same as before ... */}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg font-semibold"
                style={{ 
                  backgroundColor: 'var(--wtm-primary)',
                  color: 'white',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-sm mt-6" style={{ color: 'var(--wtm-muted)' }}>
              Already have an account?{' '}
              <Link to="/restaurant/login" style={{ color: 'var(--wtm-primary)' }}>
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignupPage;
