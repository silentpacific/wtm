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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/80 flex items-center justify-center z-50 p-4">
      <div className="bg-cream rounded-2xl p-6 border-4 border-charcoal w-full max-w-md">
        <h2 className="text-2xl font-black text-charcoal mb-4">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-charcoal rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-charcoal rounded-lg"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-coral text-white font-bold rounded-lg border-2 border-charcoal"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm text-center text-charcoal">{message}</p>
        )}

        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-coral underline"
          >
            {isLogin ? 'Need an account? Sign up' : 'Have an account? Login'}
          </button>
          
          {isLogin && (
            <button
              onClick={handlePasswordReset}
              className="block w-full text-charcoal/70 underline"
            >
              Forgot password?
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-charcoal hover:text-coral"
        >
          ✕
        </button>
      </div>
    </div>
  );
};