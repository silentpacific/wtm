import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Restaurant {
  id: number;
  business_name: string;
  slug: string;
  description_en?: string;
  contact_email?: string;
  address?: string;
  city?: string;
  country?: string;
  cuisine_type?: string;
  opening_hours?: string;
  website?: string;
  contact_phone?: string;
}

interface Dish {
  id: number;
  dish_name: string;
  section_name: string;
  price?: number;
  currency?: string;
  description_en?: string;
  allergens?: string[];
  dietary_tags?: string[];
  is_available?: boolean;
}

const RestaurantPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadRestaurantData();
    }
  }, [slug]);

  const loadRestaurantData = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔍 Loading restaurant data for slug:', slug);

      // FIXED: Use unified getRestaurantData endpoint
      const response = await fetch(`/.netlify/functions/getRestaurantData?slug=${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Restaurant not found');
        } else {
          setError(`Failed to load restaurant: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('❌ API Error:', data.error);
        setError(data.error);
        return;
      }

      console.log('✅ Restaurant data loaded:', data);

      // Set restaurant data
      if (data.restaurant) {
        setRestaurant(data.restaurant);
        console.log(`✅ Restaurant: ${data.restaurant.business_name}`);
      } else {
        setError('Restaurant data not found');
        return;
      }

      // Set dishes and sections
      const dishList = data.dishes || [];
      const sectionList = data.sections || [];
      
      console.log(`✅ Loaded ${dishList.length} dishes`);
      console.log(`📂 Sections: ${sectionList.join(', ')}`);
      
      setDishes(dishList);
      setSections(sectionList);

    } catch (error) {
      console.error('❌ Error loading restaurant:', error);
      setError('Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || `Restaurant '${slug}' not found`}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>Searched for: {slug}</p>
            <p>Please check the URL and try again.</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // FIXED: Group dishes by section_name using dynamic sections
  const groupedDishes = dishes.reduce((acc, dish) => {
    const section = dish.section_name || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{restaurant.business_name}</h1>
            
            {restaurant.description_en && (
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">{restaurant.description_en}</p>
            )}
            
            <div className="flex justify-center flex-wrap gap-4 text-sm">
              {restaurant.cuisine_type && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {restaurant.cuisine_type}
                </span>
              )}
              {restaurant.city && (
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  📍 {restaurant.city}
                </span>
              )}
              {dishes.length > 0 && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  {dishes.length} dishes available
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {dishes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Menu Coming Soon</h2>
            <p className="text-gray-600">
              {restaurant.business_name} is still setting up their digital menu. Please check back later or contact the restaurant directly!
            </p>
            {restaurant.contact_phone && (
              <p className="text-sm text-gray-500 mt-2">
                📞 {restaurant.contact_phone}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Menu Introduction */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h2>
              <p className="text-gray-600">
                Discover our delicious selection of {dishes.length} dishes across {sections.length} categories
              </p>
            </div>

            {/* FIXED: Display sections dynamically */}
            {sections.map(section => {
              const sectionDishes = groupedDishes[section] || [];
              
              if (sectionDishes.length === 0) return null;
              
              return (
                <div key={section} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{section}</h3>
                    <p className="text-sm text-gray-600">{sectionDishes.length} items</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6">
                      {sectionDishes.map((dish) => (
                        <div key={dish.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {dish.dish_name}
                              </h4>
                              
                              {dish.description_en && (
                                <p className="text-gray-600 mb-3 leading-relaxed">
                                  {dish.description_en}
                                </p>
                              )}
                              
                              {/* Tags and Allergens */}
                              {(dish.dietary_tags?.length > 0 || dish.allergens?.length > 0) && (
                                <div className="flex flex-wrap gap-2">
                                  {dish.dietary_tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                                    >
                                      ✓ {tag}
                                    </span>
                                  ))}
                                  
                                  {dish.allergens?.map((allergen) => (
                                    <span
                                      key={allergen}
                                      className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full"
                                    >
                                      ⚠️ Contains {allergen}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Price */}
                            {dish.price && (
                              <div className="text-right flex-shrink-0">
                                <p className="text-xl font-bold text-gray-900">
                                  ${dish.price.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Restaurant Information Footer */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Contact</h4>
              
              {restaurant.contact_phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📞</span>
                  <a 
                    href={`tel:${restaurant.contact_phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {restaurant.contact_phone}
                  </a>
                </div>
              )}
              
              {restaurant.contact_email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">✉️</span>
                  <a 
                    href={`mailto:${restaurant.contact_email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {restaurant.contact_email}
                  </a>
                </div>
              )}
              
              {restaurant.website && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">🌐</span>
                  <a 
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            {/* Location and Hours */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Location & Hours</h4>
              
              {restaurant.address && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">📍</span>
                  <div className="text-gray-600">
                    {restaurant.address}
                    {restaurant.city && <div>{restaurant.city}</div>}
                    {restaurant.country && <div>{restaurant.country}</div>}
                  </div>
                </div>
              )}
              
              {restaurant.opening_hours && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">🕒</span>
                  <div className="text-gray-600 whitespace-pre-line">
                    {restaurant.opening_hours}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Powered by WhatTheMenu */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Digital menu powered by{' '}
            <a 
              href="https://whatthemenu.com" 
              className="text-blue-600 hover:text-blue-700 font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatTheMenu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPublicPage;