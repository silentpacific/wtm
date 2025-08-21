import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

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
}

const RestaurantPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
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

      // Get restaurant info
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (restaurantError) {
        console.error('❌ Restaurant not found:', restaurantError);
        setError('Restaurant not found');
        return;
      }

      console.log('✅ Restaurant found:', restaurantData);
      setRestaurant(restaurantData);

      // Get menu items
      const { data: dishData, error: dishError } = await supabase
        .from('restaurant_dishes')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_available', true)
        .order('section_name, display_order');

      if (dishError) {
        console.error('❌ Error loading dishes:', dishError);
      } else {
        console.log(`✅ Loaded ${dishData?.length || 0} dishes`);
        setDishes(dishData || []);
      }

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
          <p className="text-gray-600 mb-4">Restaurant '{slug}' not found</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Group dishes by section
  const groupedDishes = dishes.reduce((acc, dish) => {
    if (!acc[dish.section_name]) {
      acc[dish.section_name] = [];
    }
    acc[dish.section_name].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.business_name}</h1>
          {restaurant.description_en && (
            <p className="text-gray-600 mb-4">{restaurant.description_en}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {restaurant.cuisine_type && (
              <span className="bg-gray-100 px-2 py-1 rounded">{restaurant.cuisine_type}</span>
            )}
            {restaurant.city && (
              <span>{restaurant.city}</span>
            )}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {dishes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Menu Coming Soon</h2>
            <p className="text-gray-600">This restaurant is still setting up their menu. Please check back later!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedDishes).map(([section, sectionDishes]) => (
              <div key={section} className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">{section}</h2>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {sectionDishes.map((dish) => (
                      <div key={dish.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dish.dish_name}</h3>
                            
                            {dish.description_en && (
                              <p className="text-gray-600 mb-3">{dish.description_en}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-2">
                              {dish.dietary_tags?.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              
                              {dish.allergens?.map((allergen) => (
                                <span
                                  key={allergen}
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                >
                                  Contains: {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          {dish.price && (
                            <div className="ml-4 text-right">
                              <p className="text-lg font-bold text-gray-900">
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
            ))}
          </div>
        )}
        
        {/* Restaurant Info Footer */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {restaurant.address && (
              <div>
                <span className="font-medium text-gray-700">Address:</span>
                <p className="text-gray-600">
                  {restaurant.address}
                  {restaurant.city && `, ${restaurant.city}`}
                  {restaurant.country && `, ${restaurant.country}`}
                </p>
              </div>
            )}
            
            {restaurant.opening_hours && (
              <div>
                <span className="font-medium text-gray-700">Hours:</span>
                <p className="text-gray-600 whitespace-pre-line">{restaurant.opening_hours}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// FIXED: Explicit default export
export default RestaurantPublicPage;