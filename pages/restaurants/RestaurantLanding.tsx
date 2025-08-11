import React from 'react';
import { Link } from 'react-router-dom';

const RestaurantLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                WhatTheMenu
              </Link>
              <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                For Restaurants
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/restaurants/login" 
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/restaurants/signup" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Attract More
              <span className="text-blue-600"> International</span> Customers
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get a professional multilingual menu page that helps tourists understand your dishes. 
              One QR code, four languages, unlimited possibilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/restaurants/signup" 
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg"
              >
                Start 7-Day Free Trial
              </Link>
              <a 
                href="#demo" 
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 font-semibold text-lg"
              >
                See Demo
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No setup fees • Cancel anytime • $25/month after trial
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Are You Losing Customers Because They Can't Understand Your Menu?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              In tourist areas like Adelaide's Chinatown, language barriers cost restaurants thousands in lost revenue every month.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">😕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Confused Customers</h3>
              <p className="text-gray-600">Tourists spend minutes staring at menus they can't understand</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Lost Sales</h3>
              <p className="text-gray-600">Customers leave without ordering or order something cheaper</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Server Overload</h3>
              <p className="text-gray-600">Staff spend too much time explaining dishes instead of serving</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              One QR Code Solves Everything
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We create a professional mobile menu page for your restaurant with translations and allergen information.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Send Us Your Menu</h4>
                    <p className="text-gray-600">Email photos of your current menu or upload through our dashboard</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">We Create Your Page</h4>
                    <p className="text-gray-600">AI processes your menu and creates translations in English, Chinese, Spanish, and French</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Display Your QR Code</h4>
                    <p className="text-gray-600">Print the QR code and place it on tables, windows, or menus. Customers scan and understand everything!</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Your Restaurant Page Preview</h4>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-3"></div>
                  <div className="text-sm text-gray-600">QR Code leads to:</div>
                  <div className="text-blue-600 font-medium">whatthemenu.com/restaurants/your-restaurant</div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Kung Pao Chicken</span>
                  <span className="text-blue-600">$18</span>
                </div>
                <div className="text-gray-600 text-xs">
                  Stir-fried chicken with peanuts and vegetables in spicy sauce
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Gluten-Free</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Contains Nuts</span>
                </div>
                
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Vegetable Spring Rolls</span>
                  <span className="text-blue-600">$12</span>
                </div>
                <div className="text-gray-600 text-xs">
                  Crispy rolls filled with fresh vegetables and herbs
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 mb-12">Everything you need to attract international customers</p>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Professional Menu Page</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">$25</span>
                <span className="text-xl text-gray-600">/month</span>
              </div>
              <p className="text-blue-600 font-medium mt-2">7-day free trial • Cancel anytime</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 text-left mb-8">
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Professional mobile menu page</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>4 language translations</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Allergen information</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Permanent QR code</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic analytics</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Menu updates included</span>
                </div>
              </div>
            </div>
            
            <Link 
              to="/restaurants/signup" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg inline-block"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Welcome International Customers?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join Adelaide restaurants already using WhatTheMenu to increase their revenue
          </p>
          <Link 
            to="/restaurants/signup" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 font-semibold text-lg inline-block mr-4"
          >
            Start Your Free Trial
          </Link>
          <a 
            href="mailto:restaurants@whatthemenu.com" 
            className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 font-semibold text-lg inline-block"
          >
            Questions? Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link to="/" className="text-xl font-bold">WhatTheMenu</Link>
              <p className="text-gray-400 text-sm mt-1">Bridging language barriers in dining</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link>
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm">Privacy</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RestaurantLanding;