import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  
  const { signIn, signUp, resetPassword } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');
  
  try {
    if (isResetPassword) {
      // Password Reset
      const { error } = await resetPassword(email);
      if (error) throw error;
      
      setMessage('Password reset email sent! Check your inbox for instructions.');
      setMessageType('success');
      setIsResetPassword(false);
      
    } else if (isLogin) {
      // FIXED: Add the missing Sign In logic
      const { error } = await signIn(email, password);
      if (error) throw error;
      
      // User is now logged in, close modal
      handleClose();
      
    } else {
      // Sign Up
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
            
      const { error } = await signUp(email, password);
      if (error) throw error;
      
      // User is now automatically logged in, close modal
      handleClose();
    }
  } catch (error: any) {
    let errorMessage = error.message;
    
    // Handle specific error types with user-friendly messages
    if (errorMessage.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (errorMessage.includes('Email not confirmed')) {
      errorMessage = 'Please check your email and click the confirmation link before signing in.';
    } else if (errorMessage.includes('User already registered')) {
      errorMessage = 'An account with this email already exists. Try signing in instead.';
    } else if (errorMessage.includes('Password should be at least')) {
      errorMessage = 'Password must be at least 6 characters long.';
    } else if (errorMessage.includes('Unable to validate email address')) {
      errorMessage = 'Please enter a valid email address.';
    }
    
    setMessage(errorMessage);
    setMessageType('error');
  } finally {
    setLoading(false);
  }
};

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setMessage('');
    setIsLogin(true);
    setIsResetPassword(false);
    onClose();
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setIsResetPassword(false);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = () => {
    setIsResetPassword(true);
    setIsLogin(true);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-cream rounded-2xl p-6 border-4 border-charcoal w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-charcoal hover:text-coral text-2xl font-bold transition-colors z-10"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-black text-charcoal mb-4 pr-8">
          {isResetPassword ? 'Reset Password' : isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-charcoal mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
              required
              disabled={loading}
            />
          </div>

          {/* Password Field - Hide for reset password */}
          {!isResetPassword && (
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-charcoal mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}

          {/* Confirm Password Field - Only for sign up */}
          {!isLogin && !isResetPassword && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-charcoal mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                {isResetPassword ? 'Sending reset email...' : isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              isResetPassword ? 'Send Reset Email' : isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            messageType === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : messageType === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="text-center">
              {message}
            </div>
          </div>
        )}

        {/* Action Links */}
        <div className="mt-4 text-center space-y-2">
          {isResetPassword ? (
            <button
              onClick={handleBackToLogin}
              className="text-coral underline hover:text-coral/80 transition-colors font-medium"
              disabled={loading}
            >
              Back to Sign In
            </button>
          ) : (
            <>
              {/* Toggle between Sign In and Sign Up */}
              <button
                onClick={handleToggleMode}
                className="block text-coral underline hover:text-coral/80 transition-colors font-medium"
                disabled={loading}
              >
                {isLogin ? 'Need an account? Sign up instead' : 'Already have an account? Sign in instead'}
              </button>

              {/* Forgot Password Link - Only show on sign in */}
              {isLogin && (
                <button
                  onClick={handleResetPassword}
                  className="block text-charcoal/70 underline hover:text-charcoal transition-colors font-medium text-sm"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              )}
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-yellow/20 rounded-lg border border-yellow/40">
          <p className="text-xs text-charcoal/70 text-center">
            🔒 Your account is secured with industry-standard encryption. 
            {!isResetPassword && !isLogin && 'You will be logged in automatically after signing up'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
