// src/pages/DemosPage.tsx - Updated with new design system
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
      features: ['Vegetarian Options', 'Gluten-Free Available', 'Wine Pairings']
    },
    {
      id: 'sample-menu-2',
      name: 'Tokyo Sushi Bar',
      cuisine: 'Japanese',
      city: 'Sydney',
      description: 'Fresh sushi and traditional Japanese cuisine with modern presentation',
      features: ['Fresh Sashimi', 'Dietary Restrictions', 'Authentic Flavors']
    },
    {
      id: 'sample-menu-3',
      name: 'Garden Bistro',
      cuisine: 'Modern Australian',
      city: 'Melbourne',
      description: 'Farm-to-table dining with seasonal ingredients and creative dishes',
      features: ['Plant-Based Options', 'Local Ingredients', 'Seasonal Menu']
    },
    {
      id: 'sample-menu-4',
      name: 'Spice Route',
      cuisine: 'Indian',
      city: 'Perth',
      description: 'Traditional Indian curries and tandoor specialties with aromatic spices',
      features: ['Spice Levels', 'Vegan Options', 'Traditional Recipes']
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Updated with new messaging */}
      <section className="bg-warm py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="heading-primary mb-6">
            Experience Accessible Menus
          </h1>
          <p className="text-xl text-wtm-muted mb-8 max-w-4xl mx-auto leading-relaxed">
            Try these demos to see how guests browse in their language, filter allergens, 
            and confirm orders—start to finish.
          </p>
          
          {/* Microcopy */}
          <p className="text-sm text-wtm-muted mb-8">
            No app download required. Works on any phone.
          </p>
        </div>
      </section>

      {/* Horizontal Stepper - Updated with new design system */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="stepper justify-center max-w-4xl mx-auto">
            <div className="step" aria-current="step">
              <div className="step__dot">1</div>
              <span className="font-medium">Choose a menu</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-gray-200"></div>
            <div className="step">
              <div className="step__dot">2</div>
              <span className="font-medium">Switch language</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-gray-200"></div>
            <div className="step">
              <div className="step__dot">3</div>
              <span className="font-medium">Filter allergens</span>
            </div>
            <div className="hidden sm:block w-8 h-px bg-gray-200"></div>
            <div className="step">
              <div className="step__dot">4</div>
              <span className="font-medium">View visual order</span>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Grid - Updated with new card system */}
      <section className="py-16 bg-warm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="heading-secondary mb-4">
              Try These Sample Menus
            </h2>
            <p className="text-lg text-wtm-muted">
              Each menu demonstrates different cuisines and accessibility features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {demoRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="card p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-wtm-text mb-2 font-heading">
                    {restaurant.name}
                  </h3>
                  <p className="text-wtm-primary font-medium">
                    {restaurant.cuisine} • {restaurant.city}
                  </p>
                </div>
                
                <p className="text-wtm-muted mb-6 leading-relaxed">
                  {restaurant.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {restaurant.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="chip chip--veg text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <Link 
                    to={`/demos/${restaurant.id}`}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    View Interactive Menu
                  </Link>
                  <Link 
                    to={`/demos/${restaurant.id}/features`}
                    className="btn btn-ghost px-4"
                  >
                    See Features
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action - Updated with new design system */}
      <section className="py-16 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-heading">
            Ready to make your restaurant accessible?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            After trying these demos, see how easy it is to get started
          </p>
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
    </div>
  );
};

export default DemosPage;