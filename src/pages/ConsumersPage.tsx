// src/pages/ConsumersPage.tsx - Simple explanation page
import React from 'react';
import { Link } from 'react-router-dom';

const ConsumersPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Understand Any Menu
            <span className="text-blue-600 block">In Your Language</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            When you scan a QR code at participating restaurants, you'll see their menu 
            in your preferred language with detailed dish information and dietary details.
          </p>
          
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-yellow-800 font-medium">
              🚧 Interactive demo coming soon! For now, see how the system works below.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works for Customers
            </h2>
            <p className="text-lg text-gray-600">
              Simple steps to access restaurant menus in your language
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Scan QR Code</h3>
              <p className="text-gray-600">
                Find the QR code on your table, menu, or window. 
                Scan with your phone camera.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Choose Language</h3>
              <p className="text-gray-600">
                Select from English, Spanish, Chinese, or French. 
                The entire menu updates instantly.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Explore Menu</h3>
              <p className="text-gray-600">
                See detailed descriptions, ingredients, allergens, 
                and dietary information for every dish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect For
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🦻</span>
                Deaf & Hard of Hearing
              </h3>
              <p className="text-gray-600">
                Visual-only interface means you can browse menus, understand dishes, 
                and make choices without needing to hear or speak.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🌎</span>
                International Visitors
              </h3>
              <p className="text-gray-600">
                See menus in your native language with cultural context 
                and detailed explanations of local dishes.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🥗</span>
                Dietary Restrictions
              </h3>
              <p className="text-gray-600">
                Filter by allergies and dietary needs. Clear warnings 
                for common allergens like nuts, gluten, dairy, and more.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">👨‍👩‍👧‍👦</span>
                Families
              </h3>
              <p className="text-gray-600">
                Help kids understand menu options and make decisions 
                with detailed, easy-to-read descriptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Restaurant */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Try a Sample Menu
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            See how accessible menus work at our demo restaurant
          </p>
          <Link 
            to="/r/demo-bistro" 
            className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            View Demo Restaurant Menu
          </Link>
        </div>
      </section>

      {/* Restaurant CTA */}
      <section className="py-16 bg-coral-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Restaurant Owner?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Make your restaurant accessible to all customers
          </p>
          <Link 
            to="/" 
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            Learn About Our Platform
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ConsumersPage;