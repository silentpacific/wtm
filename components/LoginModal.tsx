import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  const { signInWithMagicLink, signUpWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      if (isLogin) {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setEmailSent(true);
        setMessage('Check your email for a magic link to sign in!');
      } else {
        const { error } = await signUpWithMagicLink(email);
        if (error) throw error;
        setEmailSent(true);
        setMessage('Check your email for a magic link to complete your registration!');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setEmailSent(false);
    setIsLogin(true);
    onClose();
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
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        
        {emailSent ? (
          /* Email Sent Success State */
          <div className="text-center py-4">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Email Sent!</h3>
            <p className="text-charcoal/80 mb-4">
              {isLogin 
                ? "We've sent a magic link to your email. Click it to sign in instantly!"
                : "We've sent a magic link to your email. Click it to complete your registration!"
              }
            </p>
            <p className="text-sm text-charcoal/60">
              Don't see the email? Check your spam folder or try again.
            </p>
            <button
              onClick={() => {
                setEmailSent(false);
                setMessage('');
              }}
              className="mt-4 text-coral underline hover:text-coral/80 transition-colors font-medium"
            >
              Try a different email
            </button>
          </div>
        ) : (
          /* Email Input Form */
          <>
            <p className="text-charcoal/80 mb-4 text-sm">
              {isLogin 
                ? "Enter your email address and we'll send you a magic link to sign in."
                : "Enter your email address to create your account. We'll send you a magic link to get started."
              }
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                    Sending magic link...
                  </div>
                ) : (
                  `Send Magic Link`
                )}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                message.includes('Check your email') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Toggle between Sign In and Sign Up */}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                className="text-coral underline hover:text-coral/80 transition-colors font-medium"
              >
                {isLogin ? 'Need an account? Sign up instead' : 'Already have an account? Sign in instead'}
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 p-3 bg-yellow/20 rounded-lg border border-yellow/40">
              <p className="text-xs text-charcoal/70 text-center">
                🔒 No passwords needed! We'll send you a secure magic link that expires in 10 minutes.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};