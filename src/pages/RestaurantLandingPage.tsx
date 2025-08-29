// src/pages/RestaurantLandingPage.tsx - Redirects logged-in users to dashboard
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Shield, QrCode, Upload, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantLandingPage: React.FC = () => {
  const { user, restaurant, authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      if (restaurant) {
        // User has restaurant profile, go to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // User exists but no restaurant profile, go to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, restaurant, authLoading, navigate]);

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page if user is logged in (let useEffect handle redirect)
  if (user) {
    return null;
  }

  // Show marketing landing page for non-logged in users
  return (
    <div className="min-h-screen font-sans bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl font-bold mb-8 leading-[0.95] text-wtm-text tracking-tight">
            Everyone's Welcome.<br />Every Time.
          </h1>
          
          <p className="text-2xl text-wtm-muted mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            Transform your menu. Global appeal, effortless ordering.
          </p>
          
          {/* Feature icons row */}
          <div className="flex flex-wrap justify-center gap-12 mb-16 text-wtm-muted">
            <div className="flex flex-col items-center gap-3">
              <Globe size={32} className="text-wtm-primary" />
              <span className="text-sm font-medium">Expands Reach</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Shield size={32} className="text-wtm-primary" />
              <span className="text-sm font-medium">Prevents Mistakes</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <QrCode size={32} className="text-wtm-primary" />
              <span className="text-sm font-medium">Simplifies Access</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            /* <Link 
              to="/signup" 
              className="bg-wtm-primary text-white font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Free Trial
            </Link>*/
            <Link 
              to="/demos" 
              className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
            >
              See a Live Demo
            </Link>
          </div>
          
          <p className="text-sm text-wtm-muted mt-8 font-light">
            Unlock your free 14-day trial.
          </p>
        </div>
      </section>

      {/* The New Dining Experience Section */}
      <section className="py-28 bg-wtm-bg">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-wtm-text mb-8 tracking-tight">
              The New Dining Experience.
            </h2>
            <p className="text-xl text-wtm-muted font-light">
              Seamless ordering. Pure enjoyment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <div className="text-center md:text-left">
              <Globe size={48} className="text-wtm-primary mb-6 mx-auto md:mx-0" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Translate instantly. Connect globally.
              </h3>
            </div>
            
            <div className="text-center md:text-left">
              <CheckCircle size={48} className="text-wtm-primary mb-6 mx-auto md:mx-0" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Order with confidence. Always.
              </h3>
            </div>
            
            <div className="text-center md:text-left md:col-span-2 max-w-lg mx-auto">
              <MessageCircle size={48} className="text-wtm-primary mb-6 mx-auto md:mx-0" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Visual cues. Clear communication.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Clarity & Connection Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-wtm-text mb-8 tracking-tight">
              Clarity. Connection. Your Table.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <Upload size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Setup in Minutes.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Upload your menu. Live instantly. Accessible everywhere.
              </p>
            </div>
            
            <div className="text-center">
              <Shield size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Order with Confidence.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Every allergen, clearly marked. Every choice, understood.
              </p>
            </div>
            
            <div className="text-center">
              <MessageCircle size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Communicate Effortlessly.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Visual menus. Clear confirmations. Zero misunderstandings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-28 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Ready to open your doors to everyone?
          </h2>
          <p className="text-xl mb-16 font-light opacity-90 max-w-2xl mx-auto">
            Start your journey to a truly inclusive dining experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            /*<Link 
              to="/signup" 
              className="bg-white text-wtm-secondary font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-gray-50 hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Start Your Free Trial
            </Link>*/
            <Link 
              to="/contact" 
              className="bg-transparent text-white border-2 border-white font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-white/10 transition-all duration-200"
            >
              Have Questions?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantLandingPage;