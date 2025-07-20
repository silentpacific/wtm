import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage('Check your email for confirmation link!');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage('Please enter your email first');
      return;
    }
    
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage('Password reset email sent!');
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal hover:text-coral text-2xl font-bold transition-colors z-10"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 className="text-2xl font-black text-charcoal mb-4 pr-8">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-charcoal rounded-lg font-medium focus:outline-none focus:border-coral transition-colors"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal hover:bg-coral/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[4px_4px_0px_#292524] hover:shadow-[6px_6px_0px_#292524] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Logging in...' : 'Signing up...'}
              </div>
            ) : (
              isLogin ? 'Login' : 'Sign Up'
            )}
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
            message.includes('Check your email') || message.includes('reset email sent') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Toggle and Actions */}
        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(''); // Clear message when switching
            }}
            className="text-coral underline hover:text-coral/80 transition-colors font-medium"
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
          
          {isLogin && (
            <button
              onClick={handlePasswordReset}
              className="block w-full text-charcoal/70 underline hover:text-charcoal transition-colors text-sm"
            >
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};