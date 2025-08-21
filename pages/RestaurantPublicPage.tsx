import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Minus, MessageSquare, ShoppingCart, X, Globe } from 'lucide-react';

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

interface DishExplanation {
  explanation: string;
  tags?: string[];
  allergens?: string[];
  ingredients?: string[];
}

interface OrderItem {
  dish: Dish;
  quantity: number;
  customization?: string;
  questions: CustomerQuestion[];
}

interface CustomerQuestion {
  id: string;
  question: string;
  status: 'pending' | 'yes' | 'no' | 'checking';
  timestamp: number;
}

interface SessionData {
  orderList: OrderItem[];
  language: string;
  dishExplanations: Record<string, DishExplanation>;
  lastUpdated: number;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const RestaurantPublicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Enhanced state for interactive features
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [showOrderList, setShowOrderList] = useState(false);
  const [dishExplanations, setDishExplanations] = useState<Record<string, DishExplanation>>({});
  const [loadingExplanations, setLoadingExplanations] = useState<Record<string, boolean>>({});
  const [expandedDishes, setExpandedDishes] = useState<Set<number>>(new Set());
  const [customerQuestions, setCustomerQuestions] = useState<Record<string, string>>({});
  const [customizations, setCustomizations] = useState<Record<string, string>>({});

  // Session management
  const sessionKey = `wtm_session_${slug}`;

  // Load session data
  useEffect(() => {
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
      try {
        const sessionData: SessionData = JSON.parse(savedSession);
        // Only restore if session is less than 24 hours old
        if (Date.now() - sessionData.lastUpdated < 24 * 60 * 60 * 1000) {
          setOrderList(sessionData.orderList || []);
          setSelectedLanguage(sessionData.language || 'en');
          setDishExplanations(sessionData.dishExplanations || {});
          console.log('🔄 Session restored');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    }
  }, [sessionKey]);

  // Save session data - FIXED: This was the problematic section
  useEffect(() => {
    const sessionData: SessionData = {
      orderList,
      language: selectedLanguage,
      dishExplanations,
      lastUpdated: Date.now()
    };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
  }, [orderList, selectedLanguage, dishExplanations, sessionKey]);

  // Analytics tracking
  useEffect(() => {
    if (restaurant) {
      // Track page view
      if (typeof gtag !== 'undefined') {
        gtag('event', 'restaurant_page_view', {
          restaurant_id: restaurant.id,
          restaurant_name: restaurant.business_name,
          language: selectedLanguage
        });
      }
    }
  }, [restaurant, selectedLanguage]);

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

      if (data.restaurant) {
        setRestaurant(data.restaurant);
        console.log(`✅ Restaurant: ${data.restaurant.business_name}`);
      } else {
        setError('Restaurant data not found');
        return;
      }

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

  // Get dish explanation
  const getDishExplanation = async (dish: Dish) => {
    if (dishExplanations[dish.id] || loadingExplanations[dish.id]) return;

    setLoadingExplanations(prev => ({ ...prev, [dish.id]: true }));

    try {
      const response = await fetch('/.netlify/functions/getDishExplanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishName: dish.dish_name,
          language: selectedLanguage,
          restaurantId: restaurant?.id.toString(),
          restaurantName: restaurant?.business_name
        }),
      });

      if (response.ok) {
        const explanation = await response.json();
        setDishExplanations(prev => ({
          ...prev,
          [dish.id]: explanation
        }));

        // Analytics tracking - FIXED: Added proper comma
        if (typeof gtag !== 'undefined') {
          gtag('event', 'dish_explanation_viewed', {
            restaurant_id: restaurant?.id,
            dish_name: dish.dish_name,
            language: selectedLanguage
          });
        }
      }
    } catch (error) {
      console.error('Error getting dish explanation:', error);
    } finally {
      setLoadingExplanations(prev => ({ ...prev, [dish.id]: false }));
    }
  };

  // Add to order list
  const addToOrder = (dish: Dish) => {
    setOrderList(prev => {
      const existing = prev.find(item => item.dish.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { dish, quantity: 1, questions: [] }];
      }
    });

    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'dish_added_to_order', {
        restaurant_id: restaurant?.id,
        dish_name: dish.dish_name,
        price: dish.price
      });
    }
  };

  // Remove from order list
  const removeFromOrder = (dishId: number) => {
    setOrderList(prev => prev.filter(item => item.dish.id !== dishId));
  };

  // Update quantity
  const updateQuantity = (dishId: number, change: number) => {
    setOrderList(prev => 
      prev.map(item => {
        if (item.dish.id === dishId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as OrderItem[]
    );
  };

  // Add question about dish
  const addQuestion = (dishId: number, question: string) => {
    const questionId = `${dishId}_${Date.now()}`;
    setOrderList(prev =>
      prev.map(item => {
        if (item.dish.id === dishId) {
          return {
            ...item,
            questions: [...item.questions, {
              id: questionId,
              question,
              status: 'pending' as const,
              timestamp: Date.now()
            }]
          };
        }
        return item;
      })
    );
    setCustomerQuestions(prev => ({ ...prev, [dishId]: '' }));

    // Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'customer_question_added', {
        restaurant_id: restaurant?.id,
        dish_id: dishId
      });
    }
  };

  // Server response to question
  const handleServerResponse = (dishId: number, questionId: string, response: 'yes' | 'no' | 'checking') => {
    setOrderList(prev =>
      prev.map(item => {
        if (item.dish.id === dishId) {
          return {
            ...item,
            questions: item.questions.map(q =>
              q.id === questionId ? { ...q, status: response } : q
            )
          };
        }
        return item;
      })
    );
  };

  // Add customization
  const addCustomization = (dishId: number, customization: string) => {
    setOrderList(prev =>
      prev.map(item => {
        if (item.dish.id === dishId) {
          return { ...item, customization };
        }
        return item;
      })
    );
    setCustomizations(prev => ({ ...prev, [dishId]: '' }));
  };

  // Toggle dish details
  const toggleDishDetails = (dishId: number) => {
    setExpandedDishes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dishId)) {
        newSet.delete(dishId);
      } else {
        newSet.add(dishId);
        // Load explanation when expanding
        const dish = dishes.find(d => d.id === dishId);
        if (dish) {
          getDishExplanation(dish);
        }
      }
      return newSet;
    });
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

  // Group dishes by section
  const groupedDishes = dishes.reduce((acc, dish) => {
    const section = dish.section_name || 'Other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(dish);
    return acc;
  }, {} as Record<string, Dish[]>);

  const totalOrderItems = orderList.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header with Language & Order */}
      <div className="sticky top-0 bg-white shadow-sm z-50 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">{restaurant.business_name}</h1>
            {restaurant.cuisine_type && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {restaurant.cuisine_type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Globe size={16} />
                <span className="text-sm">
                  {LANGUAGES.find(l => l.code === selectedLanguage)?.flag} 
                  {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </span>
              </button>

              {showLanguageSelector && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[150px] z-10">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLanguageSelector(false);
                        // Clear explanations when language changes
                        setDishExplanations({});
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                        selectedLanguage === lang.code ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Order List Button */}
            <button
              onClick={() => setShowOrderList(true)}
              className="relative flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <ShoppingCart size={16} />
              <span className="text-sm">My Order</span>
              {totalOrderItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalOrderItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {dishes.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Menu Coming Soon</h2>
            <p className="text-gray-600">
              {restaurant.business_name} is still setting up their digital menu. Please check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Menu Introduction */}
            <div className="bg-white rounded-lg p-6 shadow-sm text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Our Menu</h2>
              <p className="text-gray-600">
                Discover our selection of {dishes.length} dishes • Tap any dish for details and explanations
              </p>
            </div>

            {/* Menu Sections */}
            {sections.map(section => {
              const sectionDishes = groupedDishes[section] || [];
              
              if (sectionDishes.length === 0) return null;
              
              return (
                <div key={section} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">{section}</h3>
                    <p className="text-sm text-gray-600">{sectionDishes.length} items</p>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {sectionDishes.map((dish) => {
                      const isExpanded = expandedDishes.has(dish.id);
                      const explanation = dishExplanations[dish.id];
                      const isLoadingExplanation = loadingExplanations[dish.id];
                      const orderItem = orderList.find(item => item.dish.id === dish.id);

                      return (
                        <div key={dish.id} className="p-6">
                          {/* Dish Header */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-4">
                              <button
                                onClick={() => toggleDishDetails(dish.id)}
                                className="text-left w-full hover:text-blue-600 transition-colors"
                              >
                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                  {dish.dish_name}
                                </h4>
                                {dish.description_en && (
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {dish.description_en}
                                  </p>
                                )}
                              </button>
                              
                              {/* Basic tags */}
                              {(dish.dietary_tags?.length > 0 || dish.allergens?.length > 0) && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {dish.dietary_tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                    >
                                      ✓ {tag}
                                    </span>
                                  ))}
                                  
                                  {dish.allergens?.map((allergen) => (
                                    <span
                                      key={allergen}
                                      className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                                    >
                                      ⚠️ {allergen}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            {/* Price and Add Button */}
                            <div className="text-right flex-shrink-0">
                              {dish.price && (
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                  ${dish.price.toFixed(2)}
                                </p>
                              )}
                              
                              {orderItem ? (
                                <div className="flex items-center gap-2 mb-2">
                                  <button
                                    onClick={() => updateQuantity(dish.id, -1)}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="min-w-[2rem] text-center font-medium">{orderItem.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(dish.id, 1)}
                                    className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => addToOrder(dish)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                                >
                                  <Plus size={14} />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                              {/* Explanation */}
                              {isLoadingExplanation ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                  <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                                  <span className="text-sm">Loading explanation...</span>
                                </div>
                              ) : explanation ? (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <h5 className="font-medium text-blue-900 mb-2">About this dish:</h5>
                                  <p className="text-blue-800 text-sm leading-relaxed mb-3">
                                    {explanation.explanation}
                                  </p>
                                  
                                  {/* Enhanced tags from AI */}
                                  {(explanation.tags?.length > 0 || explanation.allergens?.length > 0) && (
                                    <div className="flex flex-wrap gap-1">
                                      {explanation.tags?.map((tag) => (
                                        <span
                                          key={tag}
                                          className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                      
                                      {explanation.allergens?.map((allergen) => (
                                        <span
                                          key={allergen}
                                          className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded-full"
                                        >
                                          Contains: {allergen}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => getDishExplanation(dish)}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  Get detailed explanation →
                                </button>
                              )}

                              {/* Customer Interaction Section */}
                              {orderItem && (
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                  <h5 className="font-medium text-gray-900">Customization & Questions</h5>
                                  
                                  {/* Add Customization */}
                                  <div>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Any special requests? (e.g., no onions, extra spicy)"
                                        value={customizations[dish.id] || ''}
                                        onChange={(e) => setCustomizations(prev => ({ ...prev, [dish.id]: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <button
                                        onClick={() => addCustomization(dish.id, customizations[dish.id] || '')}
                                        disabled={!customizations[dish.id]?.trim()}
                                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>

                                  {/* Add Question */}
                                  <div>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Ask a question about this dish..."
                                        value={customerQuestions[dish.id] || ''}
                                        onChange={(e) => setCustomerQuestions(prev => ({ ...prev, [dish.id]: e.target.value }))}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                      />
                                      <button
                                        onClick={() => addQuestion(dish.id, customerQuestions[dish.id] || '')}
                                        disabled={!customerQuestions[dish.id]?.trim()}
                                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 text-sm"
                                      >
                                        <MessageSquare size={14} />
                                        Ask
                                      </button>
                                    </div>
                                  </div>

                                  {/* Show existing customization and questions */}
                                  {orderItem.customization && (
                                    <div className="bg-white p-3 rounded border">
                                      <p className="text-sm text-gray-700">
                                        <strong>Special request:</strong> {orderItem.customization}
                                      </p>
                                    </div>
                                  )}

                                  {orderItem.questions.map((question) => (
                                    <div key={question.id} className="bg-white p-3 rounded border">
                                      <p className="text-sm text-gray-700 mb-2">
                                        <strong>Question:</strong> {question.question}
                                      </p>
                                      <div className="flex gap-2">
                                        <span className="text-xs text-gray-500">Server response:</span>
                                        <button
                                          onClick={() => handleServerResponse(dish.id, question.id, 'yes')}
                                          disabled={question.status !== 'pending' && question.status !== 'checking'}
                                          className={`px-2 py-1 rounded text-xs ${
                                            question.status === 'yes' 
                                              ? 'bg-green-200 text-green-800' 
                                              : 'bg-gray-200 hover:bg-green-100 disabled:opacity-50'
                                          }`}
                                        >
                                          Yes
                                        </button>
                                        <button
                                          onClick={() => handleServerResponse(dish.id, question.id, 'no')}
                                          disabled={question.status !== 'pending' && question.status !== 'checking'}
                                          className={`px-2 py-1 rounded text-xs ${
                                            question.status === 'no' 
                                              ? 'bg-red-200 text-red-800' 
                                              : 'bg-gray-200 hover:bg-red-100 disabled:opacity-50'
                                          }`}
                                        >
                                          No
                                        </button>
                                        <button
                                          onClick={() => handleServerResponse(dish.id, question.id, 'checking')}
                                          disabled={question.status === 'yes' || question.status === 'no'}
                                          className={`px-2 py-1 rounded text-xs ${
                                            question.status === 'checking' 
                                              ? 'bg-yellow-200 text-yellow-800' 
                                              : 'bg-gray-200 hover:bg-yellow-100 disabled:opacity-50'
                                          }`}
                                        >
                                          Let me check
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order List Modal */}
      {showOrderList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">My Order</h3>
              <button
                onClick={() => setShowOrderList(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {orderList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Your order is empty</p>
                  <p className="text-sm">Add items from the menu to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderList.map((item) => (
                    <div key={item.dish.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.dish.dish_name}</h4>
                          {item.dish.price && (
                            <p className="text-sm text-gray-600">${item.dish.price.toFixed(2)} each</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromOrder(item.dish.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.dish.id, -1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="min-w-[2rem] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.dish.id, 1)}
                            className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        {item.dish.price && (
                          <p className="font-medium">
                            ${(item.dish.price * item.quantity).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {item.customization && (
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>Note:</strong> {item.customization}
                        </p>
                      )}

                      {item.questions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.questions.map((q) => (
                            <p key={q.id} className="text-xs text-gray-600">
                              <strong>Q:</strong> {q.question} 
                              <span className={`ml-2 px-1 rounded text-xs ${
                                q.status === 'yes' ? 'bg-green-100 text-green-800' :
                                q.status === 'no' ? 'bg-red-100 text-red-800' :
                                q.status === 'checking' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {q.status === 'pending' ? 'Pending' : q.status}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {orderList.length > 0 && (
              <div className="border-t p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium">Total Items:</span>
                  <span className="font-bold">{totalOrderItems}</span>
                </div>
                {orderList.some(item => item.dish.price) && (
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Total Cost:</span>
                    <span className="font-bold">
                      ${orderList.reduce((total, item) => total + (item.dish.price || 0) * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-600 text-center">
                  Show this list to your server when ready to order
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restaurant Info Footer */}
      <div className="bg-white border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Information</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Contact</h4>
              {restaurant.contact_phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📞</span>
                  <a href={`tel:${restaurant.contact_phone}`} className="text-blue-600 hover:text-blue-700">
                    {restaurant.contact_phone}
                  </a>
                </div>
              )}
              {restaurant.contact_email && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">✉️</span>
                  <a href={`mailto:${restaurant.contact_email}`} className="text-blue-600 hover:text-blue-700">
                    {restaurant.contact_email}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Location & Hours</h4>
              {restaurant.address && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">📍</span>
                  <div className="text-gray-600">
                    {restaurant.address}
                    {restaurant.city && <div>{restaurant.city}</div>}
                  </div>
                </div>
              )}
              {restaurant.opening_hours && (
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">🕒</span>
                  <div className="text-gray-600 whitespace-pre-line">{restaurant.opening_hours}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPublicPage;