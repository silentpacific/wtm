import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

interface RestaurantData {
  id: number;
  business_name: string;
  address: string;
  restaurant_name: string;
  restaurant_address: string;
  prices_include_tax: boolean;
  tips_included: boolean;
  service_charge_percentage: number | null;
  special_notes: string;
  menu_sections: MenuSection[];
}

interface MenuSection {
  section_name: string;
  display_order: number;
  dishes: RestaurantDish[];
}

interface RestaurantDish {
  id: number;
  dish_name: string;
  price: number;
  currency: string;
  description_en?: string;
  description_es?: string;
  description_zh?: string;
  description_fr?: string;
  allergens: string[];
  dietary_tags: string[];
  is_available: boolean;
}

interface OrderItem {
  dishId: number;
  dishName: string;
  price: number;
  quantity: number;
  customizations: string;
}

interface CustomerQuestion {
  id: string;
  questionText: string;
  dishRelated?: string;
  waiterResponse?: 'yes' | 'no' | 'checking' | null;
  responseTime?: Date;
}

const RestaurantPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dishExplanations, setDishExplanations] = useState<Record<string, string>>({});
  const [customerQuestions, setCustomerQuestions] = useState<CustomerQuestion[]>([]);
  const [showMobileOrderSummary, setShowMobileOrderSummary] = useState(false);

  // Language options
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'zh', name: '中文' },
    { code: 'fr', name: 'Français' }
  ];

  useEffect(() => {
    fetchRestaurantData();
  }, [slug]);

  const fetchRestaurantData = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      
      // Fetch restaurant data with menu info
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurant_business_accounts')
        .select(`
          id,
          business_name,
          address,
          restaurant_menus (
            id,
            restaurant_name,
            restaurant_address,
            prices_include_tax,
            tips_included,
            service_charge_percentage,
            special_notes
          )
        `)
        .eq('slug', slug)
        .single();

      if (restaurantError || !restaurantData) {
        setError('Restaurant not found');
        return;
      }

      if (!restaurantData.restaurant_menus || restaurantData.restaurant_menus.length === 0) {
        setError('Menu not available');
        return;
      }

      const menuData = restaurantData.restaurant_menus[0];

      // Fetch menu sections and dishes
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('restaurant_menu_sections')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('display_order');

      const { data: dishesData, error: dishesError } = await supabase
        .from('restaurant_dishes')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_available', true)
        .order('section_name, display_order');

      if (sectionsError || dishesError) {
        console.error('Error fetching menu data:', sectionsError || dishesError);
        setError('Failed to load menu');
        return;
      }

      // Organize dishes by section
      const organizedSections: MenuSection[] = [];
      
      if (sectionsData && dishesData) {
        // Group dishes by section
        const dishesBySection: { [key: string]: RestaurantDish[] } = {};
        dishesData.forEach(dish => {
          if (!dishesBySection[dish.section_name]) {
            dishesBySection[dish.section_name] = [];
          }
          dishesBySection[dish.section_name].push(dish);
        });

        // Create sections with their dishes
        sectionsData.forEach(section => {
          organizedSections.push({
            section_name: section.section_name,
            display_order: section.display_order,
            dishes: dishesBySection[section.section_name] || []
          });
        });
      }

      // Update global counter for menu views
      try {
        await supabase.rpc('increment_global_counter', {
          counter_name: 'menus_scanned'
        });
      } catch (counterError) {
        console.log('Counter update failed:', counterError);
      }

      setRestaurant({
        id: restaurantData.id,
        business_name: restaurantData.business_name,
        address: restaurantData.address,
        ...menuData,
        menu_sections: organizedSections
      });

    } catch (err) {
      setError('Failed to load restaurant data');
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDishExplanation = async (dish: RestaurantDish) => {
    // Check if we already have the explanation
    if (dishExplanations[dish.dish_name]) {
      return;
    }

    try {
      // Get explanation based on selected language
      let explanation = '';
      
      switch (selectedLanguage) {
        case 'es':
          explanation = dish.description_es || '';
          break;
        case 'zh':
          explanation = dish.description_zh || '';
          break;
        case 'fr':
          explanation = dish.description_fr || '';
          break;
        default:
          explanation = dish.description_en || '';
      }

      // If no explanation in selected language, fallback to English
      if (!explanation) {
        explanation = dish.description_en || `${dish.dish_name} - Description not available in selected language.`;
      }

      // Add dietary information without redundant allergen info in description
      if (dish.dietary_tags && dish.dietary_tags.length > 0) {
        explanation += `\n\n**Dietary Information:** ${dish.dietary_tags.join(', ')}`;
      }

      setDishExplanations(prev => ({
        ...prev,
        [dish.dish_name]: explanation
      }));

      // Update global counter for dish explanation views
      try {
        await supabase.rpc('increment_global_counter', {
          counter_name: 'dish_explanations'
        });
      } catch (counterError) {
        console.log('Counter update failed:', counterError);
      }

    } catch (error) {
      console.error('Failed to get dish explanation:', error);
      setDishExplanations(prev => ({
        ...prev,
        [dish.dish_name]: `${dish.dish_name} - Unable to load detailed explanation. Please ask your server for ingredients and allergen information.`
      }));
    }
  };

  const addToOrder = (dish: RestaurantDish, customizations: string = '') => {
    const existingItem = orderItems.find(item => 
      item.dishId === dish.id && item.customizations === customizations
    );

    if (existingItem) {
      setOrderItems(prev => 
        prev.map(item => 
          item.dishId === dish.id && item.customizations === customizations
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems(prev => [...prev, {
        dishId: dish.id,
        dishName: dish.dish_name,
        price: dish.price,
        quantity: 1,
        customizations
      }]);
    }

    // Show mobile notification
    setShowMobileOrderSummary(true);
    setTimeout(() => setShowMobileOrderSummary(false), 2000);
  };

  const addQuestion = (questionText: string, dishName?: string) => {
    const newQuestion: CustomerQuestion = {
      id: Date.now().toString(),
      questionText,
      dishRelated: dishName,
      waiterResponse: null
    };
    setCustomerQuestions(prev => [...prev, newQuestion]);
  };

  const updateQuestionResponse = (questionId: string, response: 'yes' | 'no' | 'checking') => {
    setCustomerQuestions(prev => 
      prev.map(question => 
        question.id === questionId 
          ? { ...question, waiterResponse: response, responseTime: new Date() }
          : question
      )
    );
  };

  const removeFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading restaurant...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Restaurant not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{restaurant.restaurant_name}</h1>
          <p className="text-gray-600 mt-1">{restaurant.restaurant_address}</p>
          
          {/* Language Selector */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose Language for Explanations
            </label>
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-lg"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Order Summary Notification */}
          {showMobileOrderSummary && (
            <div className="lg:hidden fixed top-20 left-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg z-50 text-center">
              Item added to your list! Scroll down to see your selections.
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Content */}
        <div className="lg:col-span-2">
          {/* Menu Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Menu Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Prices:</span> 
                {restaurant.prices_include_tax ? ' Include taxes' : ' Exclude taxes'}
              </p>
              <p>
                <span className="font-medium">Tips:</span> 
                {restaurant.tips_included ? ' Included' : ' Not included'}
              </p>
              {restaurant.service_charge_percentage && (
                <p>
                  <span className="font-medium">Service Charge:</span> 
                  {restaurant.service_charge_percentage}%
                </p>
              )}
              {restaurant.special_notes && (
                <p>
                  <span className="font-medium">Special Notes:</span> 
                  {restaurant.special_notes}
                </p>
              )}
            </div>
          </div>

          {/* Menu Sections */}
          {restaurant.menu_sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
                {section.section_name}
              </h2>
              
              <div className="space-y-4">
                {section.dishes.map((dish, dishIndex) => (
                  <DishItem 
                    key={dishIndex}
                    dish={dish}
                    explanation={dishExplanations[dish.dish_name]}
                    onGetExplanation={() => getDishExplanation(dish)}
                    onAddToOrder={(customizations) => addToOrder(dish, customizations)}
                    onAddQuestion={(questionText) => addQuestion(questionText, dish.dish_name)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h3 className="text-xl font-semibold mb-4">My Selections</h3>
            <p className="text-sm text-gray-600 mb-4">Show this to your waiter</p>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.dishName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.customizations && (
                          <p className="text-sm text-blue-600">Note: {item.customizations}</p>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="font-medium">£{item.price.toFixed(2)}</p>
                        <button
                          onClick={() => removeFromOrder(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Questions Section */}
                {customerQuestions.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Questions for Kitchen:</h4>
                    {customerQuestions.map((question) => (
                      <div key={question.id} className="mb-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {question.dishRelated && `${question.dishRelated}: `}
                          {question.questionText}
                        </p>
                        
                        {question.waiterResponse === null ? (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'yes')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'no')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              No
                            </button>
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'checking')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Let me check
                            </button>
                          </div>
                        ) : question.waiterResponse === 'checking' ? (
                          <div className="mt-2">
                            <p className="text-yellow-700 text-sm mb-2">⏳ Waiter is checking...</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateQuestionResponse(question.id, 'yes')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => updateQuestionResponse(question.id, 'no')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${
                              question.waiterResponse === 'yes' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              ✓ Answer: {question.waiterResponse === 'yes' ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium">
                    📱 Show This to Waiter ({orderItems.length} items)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile: Show selections at bottom */}
          <div className="lg:hidden mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">My Selections</h3>
            <p className="text-sm text-gray-600 mb-4">Show this screen to your waiter</p>
            
            {orderItems.length === 0 ? (
              <p className="text-gray-500">No items added yet</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="border-b pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.dishName}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.customizations && (
                          <p className="text-sm text-blue-600">Note: {item.customizations}</p>
                        )}
                      </div>
                      <div className="ml-2">
                        <p className="font-medium">£{item.price.toFixed(2)}</p>
                        <button
                          onClick={() => removeFromOrder(index)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Questions Section Mobile */}
                {customerQuestions.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">Questions for Kitchen:</h4>
                    {customerQuestions.map((question) => (
                      <div key={question.id} className="mb-3 p-3 bg-blue-50 rounded">
                        <p className="text-sm font-medium text-blue-900">
                          {question.dishRelated && `${question.dishRelated}: `}
                          {question.questionText}
                        </p>
                        
                        {question.waiterResponse === null ? (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'yes')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'no')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                            >
                              No
                            </button>
                            <button
                              onClick={() => updateQuestionResponse(question.id, 'checking')}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                            >
                              Let me check
                            </button>
                          </div>
                        ) : question.waiterResponse === 'checking' ? (
                          <div className="mt-2">
                            <p className="text-yellow-700 text-sm mb-2">⏳ Waiter is checking...</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateQuestionResponse(question.id, 'yes')}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => updateQuestionResponse(question.id, 'no')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <span className={`text-sm font-medium ${
                              question.waiterResponse === 'yes' ? 'text-green-700' : 'text-red-700'
                            }`}>
                              ✓ Answer: {question.waiterResponse === 'yes' ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="pt-4">
                  <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium text-lg">
                    📱 Show This Screen to Waiter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dish Item Component
interface DishItemProps {
  dish: RestaurantDish;
  explanation?: string;
  onGetExplanation: () => void;
  onAddToOrder: (customizations: string) => void;
  onAddQuestion: (questionText: string) => void;
}

const DishItem: React.FC<DishItemProps> = ({ 
  dish, 
  explanation, 
  onGetExplanation, 
  onAddToOrder,
  onAddQuestion
}) => {
  const [customizations, setCustomizations] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [questionText, setQuestionText] = useState('');

  const handleGetExplanation = () => {
    setShowExplanation(true);
    onGetExplanation();
  };

  return (
    <div className="border rounded-lg p-4">
      {/* Row 1: Dish name and price */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-medium flex-1">{dish.dish_name}</h3>
        <span className="text-lg font-semibold text-blue-600 ml-4">
          £{dish.price.toFixed(2)} {dish.currency !== 'USD' && dish.currency}
        </span>
      </div>
      
      {/* Row 2: Get explanation button */}
      {!showExplanation && (
        <div className="mb-3">
          <button
            onClick={handleGetExplanation}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded text-sm"
          >
            Get Explanation & Allergen Info
          </button>
        </div>
      )}

      {/* Row 3: Allergen tags */}
      {dish.allergens && dish.allergens.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Allergens:</p>
          <div className="flex flex-wrap gap-1">
            {dish.allergens.map((allergen, index) => (
              <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Row 4: Dietary tags */}
      {dish.dietary_tags && dish.dietary_tags.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-600 mb-1">Dietary:</p>
          <div className="flex flex-wrap gap-1">
            {dish.dietary_tags.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Explanation Section (when shown) */}
      {showExplanation && (
        <div className="mb-3 p-3 bg-gray-50 rounded">
          {explanation ? (
            <p className="text-sm text-gray-700 whitespace-pre-line">{explanation}</p>
          ) : (
            <p className="text-sm text-gray-500">Loading explanation...</p>
          )}
        </div>
      )}
      
      {/* Row 5: Customisation notes */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customisation Notes (optional)
        </label>
        <input
          type="text"
          value={customizations}
          onChange={(e) => setCustomizations(e.target.value)}
          placeholder="e.g., no onions, sauce on side"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
      </div>

      {/* Question for kitchen */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question for Kitchen (optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="e.g., Can this be made gluten-free?"
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              if (questionText.trim()) {
                onAddQuestion(questionText);
                setQuestionText('');
              }
            }}
            disabled={!questionText.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-3 py-2 rounded text-sm"
          >
            Ask
          </button>
        </div>
      </div>

      {/* Row 6: Add to list buttons */}
      <div className="space-y-2">
        <button
          onClick={() => onAddToOrder('')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
        >
          Add to My List
        </button>
        
        {customizations.trim() && (
          <button
            onClick={() => {
              onAddToOrder(customizations);
              setCustomizations('');
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm"
          >
            Add with Notes: "{customizations}"
          </button>
        )}
      </div>
    </div>
  );
};

export default RestaurantPublicPage;