// src/pages/ForgotPasswordPage.tsx - Password Reset
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
    
    // Clear error when user starts typing
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
      <div className="min-h-screen" style={{ backgroundColor: 'var(--wtm-bg)' }}>
        <div className="flex items-center justify-center py-12 px-4 min-h-screen">
          <div className="max-w-md w-full">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                  WhatThe<span style={{ color: 'var(--wtm-primary)' }}>Menu</span>
                </span>
              </Link>
            </div>

            {/* Success Message */}
            <div className="card p-8 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" 
                   style={{ backgroundColor: '#EAF8E6' }}>
                <CheckCircle size={32} style={{ color: '#235A1E' }} />
              </div>
              
              <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
                Check Your Email
              </h1>
              
              <p className="mb-6" style={{ color: 'var(--wtm-muted)' }}>
                We've sent a password reset link to:
              </p>
              
              <p className="text-lg font-semibold mb-8 p-3 rounded-lg" 
                 style={{ 
                   color: 'var(--wtm-text)', 
                   backgroundColor: 'var(--wtm-bg)' 
                 }}>
                {email}
              </p>
              
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                  Click the link in the email to reset your password. 
                  The link will expire in 24 hours.
                </p>
                
                <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="btn-ghost font-medium p-0 text-sm"
                  >
                    {isLoading ? 'Sending...' : 'send it again'}
                  </button>
                </p>
              </div>

              {/* Back to Login */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: '#EFE7E2' }}>
                <Link to="/login" className="btn-ghost inline-flex items-center">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--wtm-bg)' }}>
      <div className="flex items-center justify-center py-12 px-4 min-h-screen">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold" style={{ color: 'var(--wtm-text)' }}>
                WhatThe<span style={{ color: 'var(--wtm-primary)' }}>Menu</span>
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--wtm-text)' }}>
              Reset Password
            </h1>
            <p style={{ color: 'var(--wtm-muted)' }}>
              Enter your email to receive a reset link
            </p>
          </div>

          {/* Reset Form */}
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

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium mb-2" 
                       style={{ color: 'var(--wtm-text)' }}>
                  <Mail className="inline mr-1" size={16} />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  className={`input-field w-full ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  placeholder="your.email@restaurant.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-lg" 
                   style={{ 
                     backgroundColor: '#EAF2FF', 
                     border: '1px solid #93C5FD',
                     color: '#1A3E73'
                   }}>
                <p className="text-sm">
                  We'll send you a secure link to reset your password. 
                  The link will expire in 24 hours for your security.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`btn w-full ${isLoading ? 'btn-secondary opacity-50 cursor-not-allowed' : 'btn-primary'}`}
              >
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t text-center" style={{ borderColor: '#EFE7E2' }}>
              <Link to="/login" className="btn-ghost inline-flex items-center">
                <ArrowLeft size={16} className="mr-2" />
                Back to Sign In
              </Link>
            </div>

            {/* Help */}
            <div className="mt-4 text-center">
              <p className="text-sm" style={{ color: 'var(--wtm-muted)' }}>
                Need help?{' '}
                <Link to="/contact" className="btn-ghost font-medium p-0 text-sm">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;