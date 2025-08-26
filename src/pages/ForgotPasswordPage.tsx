// src/pages/ForgotPasswordPage.tsx - Minimalist redesign
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    
    if (errors.email) {
      setErrors({});
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
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
      await resetPassword(email);
      setIsEmailSent(true);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrors({ 
        general: error.message || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      alert('Reset email sent again!');
      
    } catch (error: any) {
      console.error('Resend error:', error);
      alert(error.message || 'Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
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
          </div>

          {/* Success Message */}
          <div className="bg-white rounded-3xl border border-gray-100 p-10 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-wtm-text mb-4 tracking-tight">
              Check Your Email
            </h1>
            
            <p className="text-lg text-wtm-muted mb-6 font-light">
              We've sent a password reset link to:
            </p>
            
            <p className="text-xl font-semibold text-wtm-text mb-8 p-4 bg-wtm-bg rounded-2xl">
              {email}
            </p>
            
            <div className="space-y-6">
              <p className="text-wtm-muted font-light leading-relaxed">
                Click the link in the email to reset your password. 
                The link will expire in 24 hours.
              </p>
              
              <p className="text-wtm-muted font-light">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
                >
                  {isLoading ? 'Sending...' : 'send it again'}
                </button>
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <Link 
                to="/login" 
                className="inline-flex items-center text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-xl text-wtm-muted font-light">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Reset Form */}
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
                value={email}
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

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <p className="text-blue-700 font-light leading-relaxed">
                We'll send you a secure link to reset your password. 
                The link will expire in 24 hours for your security.
              </p>
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
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-10 pt-8 border-t border-gray-100 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Sign In
            </Link>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-wtm-muted font-light">
              Need help?{' '}
              <Link to="/contact" className="text-wtm-primary hover:text-wtm-primary-600 font-medium transition-colors">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;