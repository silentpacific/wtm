// src/pages/RestaurantLandingPage.tsx - Simple, honest marketing page
import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coral-50 to-orange-50 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Make Your Restaurant
            <span className="text-coral-600 block">Accessible to Everyone</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Help customers with hearing impairments and language barriers by providing 
            visual menus in multiple languages with clear dietary information.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              Get Started
            </Link>
            <Link 
              to="/demos" 
              className="border-2 border-coral-600 text-coral-700 hover:bg-coral-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              The Challenge
            </h2>
            <p className="text-lg text-gray-600">
              Many customers struggle with traditional menus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🦻 Hearing Impairments
              </h3>
              <p className="text-gray-600">
                Customers who are deaf or hard of hearing need visual-only ways to 
                understand menus and communicate with staff.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                🌍 Language Barriers
              </h3>
              <p className="text-gray-600">
                International visitors and non-native speakers need menus 
                in their own language to make informed choices.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-coral-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Solution
            </h2>
            <p className="text-lg text-gray-600">
              QR codes that lead to accessible, multilingual menus
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Setup</h3>
              <p className="text-gray-600">
                Upload your menu, get QR codes to print and display
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Languages</h3>
              <p className="text-gray-600">
                Automatic translations in English, Spanish, Chinese, and French
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-2xl">♿</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fully Accessible</h3>
              <p className="text-gray-600">
                Visual-only interface with clear allergen and dietary information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make Your Restaurant More Accessible?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join restaurants that are serving all customers with confidence
          </p>
          <Link 
            to="/contact" 
            className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default RestaurantLandingPage;