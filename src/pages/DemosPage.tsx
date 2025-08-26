// src/pages/DemosPage.tsx - Demo Menus Landing Page
import React from 'react';
import { Link } from 'react-router-dom';

const DemosPage: React.FC = () => {
  const demoRestaurants = [
    {
      id: 'sample-menu-1',
      name: 'Bella Vista Italian',
      cuisine: 'Italian',
      city: 'Adelaide',
      description: 'Authentic Italian dishes with fresh pasta and traditional flavors',
      image: '🍝',
      features: ['Vegetarian Options', 'Gluten-Free Available', 'Wine Pairings']
    },
    {
      id: 'sample-menu-2',
      name: 'Tokyo Sushi Bar',
      cuisine: 'Japanese',
      city: 'Sydney',
      description: 'Fresh sushi and traditional Japanese cuisine with modern presentation',
      image: '🍣',
      features: ['Fresh Sashimi', 'Dietary Restrictions', 'Authentic Flavors']
    },
    {
      id: 'sample-menu-3',
      name: 'Garden Bistro',
      cuisine: 'Modern Australian',
      city: 'Melbourne',
      description: 'Farm-to-table dining with seasonal ingredients and creative dishes',
      image: '🥗',
      features: ['Plant-Based Options', 'Local Ingredients', 'Seasonal Menu']
    },
    {
      id: 'sample-menu-4',
      name: 'Spice Route',
      cuisine: 'Indian',
      city: 'Perth',
      description: 'Traditional Indian curries and tandoor specialties with aromatic spices',
      image: '🍛',
      features: ['Spice Levels', 'Vegan Options', 'Traditional Recipes']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-coral-50 to-orange-50 py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Experience Accessible Menus
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Try our interactive demo menus to see how customers with hearing impairments 
            and language barriers can easily browse and understand restaurant offerings.
          </p>
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-sm">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <span className="text-2xl mb-2 block">🌍</span>
                <span className="text-sm font-semibold text-gray-700">4 Languages</span>
              </div>
              <div className="text-center">
                <span className="text-2xl mb-2 block">♿</span>
                <span className="text-sm font-semibold text-gray-700">Fully Accessible</span>
              </div>
              <div className="text-center">
                <span className="text-2xl mb-2 block">📱</span>
                <span className="text-sm font-semibold text-gray-700">Mobile Optimized</span>
              </div>
              <div className="text-center">
                <span className="text-2xl mb-2 block">⚠️</span>
                <span className="text-sm font-semibold text-gray-700">Allergen Safe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Instructions */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How to Use the Demos
            </h2>
            <p className="text-lg text-gray-600">
              Each demo shows exactly what your customers will experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-coral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Choose Menu</h3>
              <p className="text-sm text-gray-600">Select a demo restaurant below</p>
            </div>
            <div className="text-center">
              <div className="bg-coral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Switch Language</h3>
              <p className="text-sm text-gray-600">Try EN, ES, ZH, or FR</p>
            </div>
            <div className="text-center">
              <div className="bg-coral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Filter Allergens</h3>
              <p className="text-sm text-gray-600">Test dietary restrictions</p>
            </div>
            <div className="text-center">
              <div className="bg-coral-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-coral-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Visual Interface</h3>
              <p className="text-sm text-gray-600">Experience audio-free browsing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Restaurant Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Try These Sample Menus
            </h2>
            <p className="text-lg text-gray-600">
              Each menu demonstrates different cuisines and accessibility features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {demoRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-4xl mr-4">{restaurant.image}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
                        <p className="text-coral-600 font-semibold">{restaurant.cuisine} • {restaurant.city}</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{restaurant.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {restaurant.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-coral-50 text-coral-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  <Link 
                    to={`/demos/${restaurant.id}`}
                    className="block w-full bg-coral-600 hover:bg-coral-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Interactive Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make Your Restaurant Accessible?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            After trying these demos, see how easy it is to get started
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-coral-600 hover:bg-coral-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
            >
              Sign Up Your Restaurant
            </Link>
            <Link 
              to="/contact" 
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
            >
              Ask Questions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemosPage;