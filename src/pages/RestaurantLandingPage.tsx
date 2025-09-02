// src/pages/RestaurantLandingPage.tsx - Redirects logged-in users to dashboard
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, Shield, QrCode, Upload, CheckCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const RestaurantLandingPage: React.FC = () => {
  const { user, restaurant, authLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl sm:text-7xl font-bold mb-8 leading-[0.95] text-wtm-text tracking-tight">
            Make Your Menu Instantly Accessible<br />to Every Guest.
          </h1>
          
          <p className="text-2xl text-wtm-muted mb-16 max-w-2xl mx-auto leading-relaxed font-light">
            From tourists to locals with dietary needs — remove barriers, grow your reach, and give every diner confidence.
          </p>
          
          {/* Feature icons row */}
          <div className="flex flex-wrap justify-center gap-12 mb-16 text-wtm-muted">
            <div className="flex flex-col items-center gap-3 text-center">
              <Globe size={32} className="text-wtm-primary mx-auto" />
              <span className="text-sm font-medium">Bring in more customers</span>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <Shield size={32} className="text-wtm-primary mx-auto" />
              <span className="text-sm font-medium">Reduce costly order errors</span>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <QrCode size={32} className="text-wtm-primary mx-auto" />
              <span className="text-sm font-medium">No apps. Just scan and order</span>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex justify-center">
            <Link 
              to="/demos" 
              className="bg-transparent text-wtm-primary border-2 border-wtm-primary font-semibold px-12 py-5 rounded-2xl text-lg hover:bg-wtm-primary hover:text-white transition-all duration-200"
            >
              See a Live Demo (No App Required)
            </Link>
          </div>
          
          <p className="text-sm text-wtm-muted mt-8 font-light">
            Unlock your free 14-day trial.
          </p>
        </div>
      </section>

      {/* The New Dining Experience Section */}
      <section className="py-28 bg-wtm-bg">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="mb-20">
            <h2 className="text-5xl font-bold text-wtm-text mb-8 tracking-tight">
              The New Dining Experience.
            </h2>
            <p className="text-xl text-wtm-muted font-light">
              Seamless ordering. Pure enjoyment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
            <div className="text-center">
              <Globe size={48} className="text-wtm-primary mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Automatic translations — welcome international guests without hiring extra staff.
              </h3>
            </div>
            
            <div className="text-center">
              <CheckCircle size={48} className="text-wtm-primary mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Allergen & diet filters — diners choose safely, staff save time.
              </h3>
            </div>
            
            <div className="text-center md:col-span-2 max-w-lg mx-auto">
              <MessageCircle size={48} className="text-wtm-primary mb-6 mx-auto" />
              <h3 className="text-2xl font-semibold text-wtm-text mb-4">
                Icons & visual menus — reduce misunderstandings, speed up service.
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Clarity & Connection Section */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-20">
            <h2 className="text-5xl font-bold text-wtm-text mb-8 tracking-tight">
              Clarity. Connection. Your Table.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center">
              <Upload size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Transform your menu once.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Automatic feature updates as we release them.
              </p>
            </div>
            
            <div className="text-center">
              <Shield size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Protect your guests, protect your business.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Allergens and restrictions clearly shown.
              </p>
            </div>
            
            <div className="text-center">
              <MessageCircle size={56} className="text-wtm-primary mb-8 mx-auto" />
              <h3 className="text-2xl font-bold text-wtm-text mb-6">
                Faster ordering, fewer mistakes.
              </h3>
              <p className="text-lg text-wtm-muted leading-relaxed font-light">
                Clear menus your staff and guests trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-28 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight tracking-tight">
            Ready to Attract More Guests and Avoid Order Errors?
          </h2>
          <p className="text-xl mb-16 font-light opacity-90 max-w-2xl mx-auto">
            Contact us to get on the waitlist. An accessible menu can boost your bottom line.
          </p>
          
          <div className="flex justify-center">
            <Link 
              to="/faq" 
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
