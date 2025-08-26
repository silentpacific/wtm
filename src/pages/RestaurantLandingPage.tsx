// src/pages/RestaurantLandingPage.tsx - Refined UI (no emojis/icons, no extra sections)
import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-wtm-secondary/5 to-warm py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight text-wtm-text">
            Make every guest feel welcome
          </h1>
          
          <p className="text-lg sm:text-xl text-wtm-muted mb-8 max-w-3xl mx-auto leading-relaxed">
            WhatTheMenu turns your menu into an interactive, multilingual guide with clear allergen 
            and dietary info — so tourists, expats, and Deaf customers can order with confidence.
          </p>
          
          {/* Badge row */}
          <div className="text-sm text-wtm-muted mb-10 flex flex-wrap justify-center gap-6">
            <span>Setup in minutes</span>
            <span>5+ languages</span>
            <span>Allergen filters</span>
            <span>QR codes for tables</span>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-wtm-primary text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:scale-105 transition-transform duration-200"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/demos" 
              className="bg-white text-wtm-primary border-2 border-wtm-primary font-semibold px-8 py-4 rounded-xl hover:bg-wtm-primary hover:text-white transition-colors duration-200"
            >
              See a Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Problem ⇄ Solution */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div className="bg-warm/30 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-wtm-text">The challenge in busy dining rooms</h2>
            <ul className="space-y-4 text-wtm-muted leading-relaxed list-disc list-inside">
              <li>Mixed languages and accents make menus hard to follow.</li>
              <li>Deaf and hard-of-hearing guests rely on visual, not spoken, info.</li>
              <li>Allergen & dietary needs must be crystal clear.</li>
            </ul>
          </div>
          
          <div className="bg-warm/30 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-wtm-text">WhatTheMenu does for you</h2>
            <ul className="space-y-4 text-wtm-muted leading-relaxed list-disc list-inside">
              <li>Instant menu translations in 5+ languages.</li>
              <li>Allergen & dietary filters that remove risk.</li>
              <li>Visual interface to confirm orders — no app download.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Value Props - 3 Cards */}
      <section className="py-20 bg-warm">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <div className="card p-8 text-center hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-wtm-text mb-3">Upload once, share everywhere</h3>
            <p className="text-wtm-muted leading-relaxed">
              PDF or image in → accessible web menu out. QR codes for tables included.
            </p>
          </div>
          
          <div className="card p-8 text-center hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-wtm-text mb-3">Safe choices, fewer mistakes</h3>
            <p className="text-wtm-muted leading-relaxed">
              Guests filter allergens and see clear dietary tags before they order.
            </p>
          </div>
          
          <div className="card p-8 text-center hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-xl font-semibold text-wtm-text mb-3">Friendly for Deaf customers</h3>
            <p className="text-wtm-muted leading-relaxed">
              Visual phrases and order confirmation help reduce back-and-forth.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-20 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">Ready to make your restaurant accessible?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-wtm-secondary hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl shadow-md transition-transform duration-200 hover:scale-105"
            >
              Sign Up Your Restaurant
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent text-white border-2 border-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors duration-200"
            >
              Ask Questions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RestaurantLandingPage;
