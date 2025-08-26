// src/pages/RestaurantLandingPage.tsx - Updated with new design system
import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-warm py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="heading-primary mb-6">
            Make every guest feel welcome
          </h1>
          
          <p className="text-xl text-wtm-muted mb-6 max-w-4xl mx-auto leading-relaxed">
            WhatTheMenu turns your menu into an interactive, multilingual guide with clear allergen 
            and dietary info—so tourists, expats, and Deaf customers can order with confidence.
          </p>
          
          {/* Badge text only - no icons */}
          <div className="text-sm text-wtm-muted mb-8 flex flex-wrap justify-center gap-6">
            <span>Setup in minutes</span>
            <span className="hidden sm:inline">•</span>
            <span>5+ languages</span>
            <span className="hidden sm:inline">•</span>
            <span>Allergen filters</span>
            <span className="hidden sm:inline">•</span>
            <span>QR codes for tables</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="btn btn-primary text-lg px-8 py-4"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/demos" 
              className="btn btn-secondary text-lg px-8 py-4"
            >
              See a Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Problem ⇄ Solution Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Left - The Challenge */}
            <div>
              <h2 className="heading-secondary mb-6 text-wtm-text">
                The challenge in busy dining rooms
              </h2>
              <div className="space-y-4">
                <p className="text-wtm-muted leading-relaxed">
                  Mixed languages and accents make menus hard to follow.
                </p>
                <p className="text-wtm-muted leading-relaxed">
                  Deaf and hard-of-hearing guests rely on visual, not spoken, info.
                </p>
                <p className="text-wtm-muted leading-relaxed">
                  Allergen & dietary needs must be crystal clear.
                </p>
              </div>
            </div>
            
            {/* Right - WhatTheMenu Solution */}
            <div>
              <h2 className="heading-secondary mb-6 text-wtm-text">
                WhatTheMenu does for you
              </h2>
              <div className="space-y-4">
                <p className="text-wtm-muted leading-relaxed">
                  Instant menu translations in 5+ languages.
                </p>
                <p className="text-wtm-muted leading-relaxed">
                  Allergen & dietary filters that remove risk.
                </p>
                <p className="text-wtm-muted leading-relaxed">
                  Visual interface to confirm orders—no app download.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props - 3 Cards */}
      <section className="py-16 bg-warm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-wtm-text mb-4 font-heading">
                Upload once, share everywhere
              </h3>
              <p className="text-wtm-muted leading-relaxed">
                PDF or image in → accessible web menu out. QR codes for tables included.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-wtm-text mb-4 font-heading">
                Safe choices, fewer mistakes
              </h3>
              <p className="text-wtm-muted leading-relaxed">
                Guests filter allergens and see clear dietary tags before they order.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <h3 className="text-xl font-semibold text-wtm-text mb-4 font-heading">
                Friendly for Deaf customers
              </h3>
              <p className="text-wtm-muted leading-relaxed">
                Visual phrases and order confirmation help reduce back-and-forth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-heading">
            Ready to make your restaurant accessible?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-wtm-secondary hover:bg-gray-50 font-semibold px-8 py-4 rounded-2xl transition-colors duration-200 inline-flex items-center justify-center"
            >
              Sign Up Your Restaurant
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-2xl border-2 border-white transition-colors duration-200 inline-flex items-center justify-center"
            >
              Ask Questions
            </Link>
          </div>
        </div>
      </section>

      {/* Optional: Testimonial or Trust Section */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-wtm-muted">
            Helping restaurants serve all customers with confidence
          </p>
        </div>
      </section>
    </div>
  );
};

export default RestaurantLandingPage;