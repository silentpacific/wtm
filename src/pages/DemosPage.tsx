// src/pages/DemosPage.tsx - Minimalist redesign
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Shield, MessageCircle, QrCode } from 'lucide-react';

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
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 bg-wtm-bg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-8 leading-tight text-wtm-text tracking-tight">
            Try. Experience. Believe.
          </h1>
          <p className="text-xl text-wtm-muted mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            See how guests browse in their language, filter allergens, and confirm orders — start to finish.
          </p>
          
          <p className="text-lg text-wtm-muted font-light">
            No app download required. Works on any phone.
          </p>
        </div>
      </section>

      {/* Demo Grid */}
      <section className="py-20 bg-wtm-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-wtm-text mb-6 tracking-tight">
              Sample Restaurants
            </h2>
            <p className="text-xl text-wtm-muted font-light">
              Each menu demonstrates different cuisines and accessibility features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {demoRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-wtm-text mb-3 tracking-tight">
                    {restaurant.name}
                  </h3>
                  <p className="text-wtm-primary font-medium text-lg">
                    {restaurant.cuisine} • {restaurant.city}
                  </p>
                </div>
                
                <p className="text-wtm-muted mb-6 leading-relaxed font-light text-lg">
                  {restaurant.description}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-8">
                  {restaurant.features.map((feature, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <Link 
                    to={`/demos/${restaurant.id}`}
                    className="flex-1 bg-wtm-primary text-white font-semibold py-4 px-6 rounded-2xl text-center hover:bg-wtm-primary-600 hover:scale-[1.02] transition-all duration-200 shadow-md"
                  >
                    Try Interactive Menu
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-wtm-secondary text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight tracking-tight">
            Ready to welcome everyone?
          </h2>
          <p className="text-xl text-white/90 mb-12 font-light">
            After trying these demos, see how easy it is to get started
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/signup" 
              className="bg-white text-wtm-secondary hover:bg-gray-50 font-semibold px-10 py-5 rounded-2xl transition-all duration-200 inline-flex items-center justify-center hover:scale-[1.02] shadow-lg text-lg"
            >
              Start Your Free Trial
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent text-white hover:bg-white/10 font-semibold px-10 py-5 rounded-2xl border-2 border-white transition-all duration-200 inline-flex items-center justify-center text-lg"
            >
              Have Questions?
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemosPage;

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-wtm-text mb-6 tracking-tight">
              Four steps. Zero confusion.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-wtm-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-wtm-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold text-wtm-text mb-4">
                Choose a menu
              </h3>
              <p className="text-wtm-muted leading-relaxed font-light">
                Pick from our sample restaurants below
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-wtm-primary/10 flex items-center justify-center mx-auto mb-6">
                <Globe size={28} className="text-wtm-primary" />
              </div>
              <h3 className="text-xl font-semibold text-wtm-text mb-4">
                Switch language
              </h3>
              <p className="text-wtm-muted leading-relaxed font-light">
                See instant translations in action
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-wtm-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield size={28} className="text-wtm-primary" />
              </div>
              <h3 className="text-xl font-semibold text-wtm-text mb-4">
                Filter allergens
              </h3>
              <p className="text-wtm-muted leading-relaxed font-light">
                Hide items with specific allergens
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-wtm-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle size={28} className="text-wtm-primary" />
              </div>
              <h3 className="text-xl font-semibold text-wtm-text mb-4">
                Confirm visually
              </h3>
              <p className="text-wtm-muted leading-relaxed font-light">
                Order without speaking
              </p>
            </div>
          </div>
        </div>
      </section>