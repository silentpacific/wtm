// src/pages/ConsumersPage.tsx - Simple explanation page
import React from 'react';
import { Link } from 'react-router-dom';

const ConsumersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--wtm-bg)' }}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--wtm-text)' }}>
            Make every guest feel welcome
            <span className="block" style={{ color: 'var(--wtm-primary)' }}>
              In any language
            </span>
          </h1>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'var(--wtm-muted)' }}>
            When you scan a QR code at participating restaurants, you'll see their menu 
            in your preferred language with clear allergen filters and dietary information.
          </p>
          
          <div className="p-4 max-w-2xl mx-auto rounded-lg" 
               style={{ 
                 backgroundColor: 'var(--chip-nuts-bg)', 
                 border: `1px solid var(--chip-nuts-fg)` 
               }}>
            <p className="font-medium" style={{ color: 'var(--chip-nuts-fg)' }}>
              Interactive demo coming soon! For now, see how the system works below.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{ backgroundColor: 'var(--wtm-surface)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
              How It Works for Customers
            </h2>
            <p className="text-lg" style={{ color: 'var(--wtm-muted)' }}>
              Simple steps to access restaurant menus in your language
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
                   style={{ backgroundColor: 'var(--chip-shell-bg)' }}>
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
                1. Scan QR Code
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Find the QR code on your table, menu, or window. 
                Scan with your phone camera.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
                   style={{ backgroundColor: 'var(--chip-dairy-bg)' }}>
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
                2. Choose Language
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Select from English, Spanish, Chinese, or French. 
                The entire menu updates instantly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
                   style={{ backgroundColor: 'var(--chip-veg-bg)' }}>
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--wtm-text)' }}>
                3. Explore Menu
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                See detailed descriptions, ingredients, allergens, 
                and dietary information for every dish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16" style={{ backgroundColor: 'var(--wtm-bg)' }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
              Perfect For
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <span className="mr-3">🦻</span>
                Deaf & Hard of Hearing
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Visual phrases and order confirmation help reduce back-and-forth.
                Browse menus and make choices without needing to hear or speak.
              </p>
            </div>
            
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <span className="mr-3">🌎</span>
                Tourists & Expats
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Instant menu translations in 5+ languages with cultural context 
                and detailed explanations of local dishes.
              </p>
            </div>
            
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <span className="mr-3">🥗</span>
                Dietary Restrictions
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Guests filter allergens and see clear dietary tags before they order.
                Clear warnings for nuts, gluten, dairy, and more.
              </p>
            </div>
            
            <div className="card p-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center" 
                  style={{ color: 'var(--wtm-text)' }}>
                <span className="mr-3">👨‍👩‍👧‍👦</span>
                Families
              </h3>
              <p style={{ color: 'var(--wtm-muted)' }}>
                Help kids understand menu options and make decisions 
                with detailed, easy-to-read descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Restaurant */}
      <section className="py-16" style={{ backgroundColor: 'var(--wtm-surface)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
            Try a Sample Menu
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--wtm-muted)' }}>
            See how accessible menus work at our demo restaurant
          </p>
          <Link 
            to="/demos/sample-menu-1" 
            className="btn btn-primary text-lg py-4 px-8 inline-block"
          >
            See a Live Demo
          </Link>
        </div>
      </section>

      {/* Restaurant CTA */}
      <section className="py-16" style={{ backgroundColor: '#FCEDEA' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--wtm-text)' }}>
            Ready to make your restaurant accessible?
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--wtm-muted)' }}>
            Make your restaurant accessible to all customers
          </p>
          <Link 
            to="/signup" 
            className="btn btn-secondary text-lg py-4 px-8 inline-block"
          >
            Sign Up Your Restaurant
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ConsumersPage;