import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Filter, X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { translationService } from '../services/translationService';
import { restaurantService } from '../services/restaurantService';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const allAllergens = ['gluten', 'dairy', 'eggs', 'nuts', 'fish', 'shellfish', 'soy'];
const allDietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb'];

// Simple inline translation hook - no external files needed
function useTranslation(language: string) {
  const [translations, setTranslations] = useState({});
  const [allergenTranslations, setAllergenTranslations] = useState({});
  const [dietaryTagTranslations, setDietaryTagTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [ui, allergens, dietary] = await Promise.all([
          translationService.getTranslations(language),
          translationService.getAllergenTranslations(language),
          translationService.getDietaryTagTranslations(language)
        ]);
        setTranslations(ui);
        setAllergenTranslations(allergens);
        setDietaryTagTranslations(dietary);
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to English-like text
        setTranslations({
          choose_language: 'Choose Language',
          filters: 'Filters',
          exclude_allergens: 'Exclude Allergens',
          dietary_requirements: 'Dietary Requirements',
          apply_filters: 'Apply Filters',
          clear: 'Clear',
          prices_include_tax: 'Prices include tax',
          service_charge: 'Service charge',
          yes: 'Yes',
          no: 'No',
          add_to_list: 'Add to My List',
          remove: 'Remove',
          my_selections: 'My Selections',
          no_items_selected: 'No items selected',
          tap_to_view: 'Tap to view',
          items_in_list: 'items in your list',
          customisation: 'Customisation',
          question: 'Question',
          any_customisation: 'Any customisation requests...',
          question_for_kitchen: 'Question for kitchen...',
          show_to_waiter: '👆 Show this screen to your waiter'
        });
        setAllergenTranslations({
          gluten: 'Gluten', dairy: 'Dairy', eggs: 'Eggs', nuts: 'Nuts',
          fish: 'Fish', shellfish: 'Shellfish', soy: 'Soy'
        });
        setDietaryTagTranslations({
          vegetarian: 'Vegetarian', vegan: 'Vegan', 'gluten-free': 'Gluten Free',
          'dairy-free': 'Dairy Free', 'low-carb': 'Low Carb'
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadTranslations();
  }, [language]);

  const t = (key: string) => translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const getAllergenName = (key: string) => allergenTranslations[key] || key.charAt(0).toUpperCase() + key.slice(1);
  const getDietaryTagName = (key: string) => dietaryTagTranslations[key] || key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return { t, getAllergenName, getDietaryTagName, isLoading };
}

export default function RestaurantPublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showFilters, setShowFilters] = useState(false);
  const [excludeAllergens, setExcludeAllergens] = useState<string[]>([]);
  const [includeDietary, setIncludeDietary] = useState<string[]>([]);
  const [mySelections, setMySelections] = useState<any[]>([]);
  const [showSelections, setShowSelections] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [customisations, setCustomisations] = useState<{ [key: number]: string }>({});
  const [questions, setQuestions] = useState<{ [key: number]: string }>({});
  
  // Data loading states
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Translation hook
  const { t, getAllergenName, getDietaryTagName, isLoading: translationsLoading } = useTranslation(selectedLanguage);

  // Load restaurant data
  useEffect(() => {
    if (!slug) return;

    const loadRestaurantData = async () => {
      setDataLoading(true);
      setDataError(null);

      try {
        const data = await restaurantService.getRestaurantData(slug);
        setRestaurantData(data);
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'Failed to load restaurant data');
        console.error('Restaurant data loading error:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadRestaurantData();
  }, [slug]);

  // Filter dishes based on selected filters
  const filteredDishes = restaurantData?.dishes.filter((dish: any) => {
    // Exclude dishes with selected allergens
    if (excludeAllergens.length > 0) {
      const hasExcludedAllergen = dish.allergens?.some((allergen: string) => 
        excludeAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) return false;
    }

    // Include only dishes with selected dietary tags
    if (includeDietary.length > 0) {
      const hasDietaryTag = includeDietary.some(tag => 
        dish.dietary_tags?.includes(tag)
      );
      if (!hasDietaryTag) return false;
    }

    return true;
  }) || [];

  // Group dishes by section
  const groupedDishes = filteredDishes.reduce((acc: any, dish: any) => {
    const sectionName = dish.section_name;
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(dish);
    return acc;
  }, {});

  const addToSelections = (dish: any) => {
    const existingItem = mySelections.find(item => item.id === dish.id);
    if (!existingItem) {
      setMySelections([...mySelections, { ...dish, quantity: 1 }]);
      setQuantities({ ...quantities, [dish.id]: 1 });
    }
  };

  const removeFromSelections = (dishId: number) => {
    setMySelections(mySelections.filter(item => item.id !== dishId));
    const newQuantities = { ...quantities };
    delete newQuantities[dishId];
    setQuantities(newQuantities);
    
    // Also clear customisations and questions
    const newCustomisations = { ...customisations };
    const newQuestions = { ...questions };
    delete newCustomisations[dishId];
    delete newQuestions[dishId];
    setCustomisations(newCustomisations);
    setQuestions(newQuestions);
  };

  const updateQuantity = (dishId: number, change: number) => {
    const newQuantity = (quantities[dishId] || 1) + change;
    if (newQuantity <= 0) {
      removeFromSelections(dishId);
    } else {
      setQuantities({ ...quantities, [dishId]: newQuantity });
      setMySelections(mySelections.map(item => 
        item.id === dishId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const clearFilters = () => {
    setExcludeAllergens([]);
    setIncludeDietary([]);
  };

  const getDishDescription = (dish: any): string => {
    return restaurantService.getDishDescription(dish, selectedLanguage);
  };

  const totalItems = mySelections.reduce((sum, item) => sum + item.quantity, 0);

  // Loading state
  if (dataLoading || translationsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading restaurant menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (dataError || !restaurantData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600 mb-4">{dataError || 'The restaurant you are looking for does not exist.'}</p>
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

  const { restaurant, menu } = restaurantData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{restaurant.business_name}</h1>
          <p className="text-sm text-gray-600">
            {restaurant.address || menu.restaurant_address}
            {restaurant.city && `, ${restaurant.city}`}
            {restaurant.country && `, ${restaurant.country}`}
          </p>
          {restaurant.cuisine_type && (
            <p className="text-xs text-blue-600 font-medium">{restaurant.cuisine_type}</p>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Language Selector Pills */}
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">{t('choose_language')}</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedLanguage === lang.code
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-between w-full p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Filter size={16} />
              {t('filters')}
              {(excludeAllergens.length > 0 || includeDietary.length > 0) && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {excludeAllergens.length + includeDietary.length}
                </span>
              )}
            </span>
            <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {showFilters && (
            <div className="mt-2 p-4 bg-white rounded-lg border border-gray-200">
              {/* Exclude Allergens */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('exclude_allergens')}</h4>
                <div className="space-y-2">
                  {allAllergens.map((allergen) => (
                    <label key={allergen} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={excludeAllergens.includes(allergen)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setExcludeAllergens([...excludeAllergens, allergen]);
                          } else {
                            setExcludeAllergens(excludeAllergens.filter(a => a !== allergen));
                          }
                        }}
                        className="rounded text-blue-600 mr-2"
                      />
                      <span className="text-sm">{getAllergenName(allergen)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('dietary_requirements')}</h4>
                <div className="space-y-2">
                  {allDietaryTags.map((tag) => (
                    <label key={tag} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={includeDietary.includes(tag)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIncludeDietary([...includeDietary, tag]);
                          } else {
                            setIncludeDietary(includeDietary.filter(t => t !== tag));
                          }
                        }}
                        className="rounded text-blue-600 mr-2"
                      />
                      <span className="text-sm">{getDietaryTagName(tag)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-2">
                <button
                  onClick={applyFilters}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  {t('apply_filters')}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  {t('clear')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <p>• {t('prices_include_tax')}: {menu.prices_include_tax ? t('yes') : t('no')}</p>
            {menu.service_charge_percentage && (
              <p>• {t('service_charge')}: {menu.service_charge_percentage}%</p>
            )}
            {menu.special_notes && <p>• {menu.special_notes}</p>}
            {menu.menu_description && <p>• {menu.menu_description}</p>}
          </div>
        </div>

        {/* Menu Sections */}
        {Object.entries(groupedDishes).map(([sectionName, dishes]: [string, any]) => (
          <div key={sectionName} className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{sectionName}</h2>
            <div className="space-y-3">
              {dishes.map((dish: any) => {
                const isInSelections = mySelections.some(item => item.id === dish.id);
                const quantity = quantities[dish.id] || 1;
                
                return (
                  <div key={dish.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    {/* Dish Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 flex-1">{dish.dish_name}</h3>
                      {dish.price && (
                        <span className="text-lg font-bold text-blue-600 ml-2">
                          {dish.currency === 'GBP' ? '£' : dish.currency === 'EUR' ? '€' : '$'}{dish.price}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {getDishDescription(dish) && (
                      <p className="text-sm text-gray-600 mb-3">{getDishDescription(dish)}</p>
                    )}

                    {/* Allergens & Dietary Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dish.allergens?.map((allergen: string) => (
                        <span key={allergen} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          ⚠️ {getAllergenName(allergen)}
                        </span>
                      ))}
                      {dish.dietary_tags?.map((tag: string) => (
                        <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          ✓ {getDietaryTagName(tag)}
                        </span>
                      ))}
                    </div>

                    {/* Customisation */}
                    <textarea
                      placeholder={t('any_customisation')}
                      value={customisations[dish.id] || ''}
                      onChange={(e) => setCustomisations({...customisations, [dish.id]: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-2 resize-none h-16"
                    />

                    {/* Question for Kitchen */}
                    <textarea
                      placeholder={t('question_for_kitchen')}
                      value={questions[dish.id] || ''}
                      onChange={(e) => setQuestions({...questions, [dish.id]: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-3 resize-none h-16"
                    />

                    {/* Add/Remove Controls */}
                    {!isInSelections ? (
                      <button
                        onClick={() => addToSelections(dish)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        {t('add_to_list')}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromSelections(dish.id)}
                          className="text-red-600 font-medium hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          {t('remove')}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredDishes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No dishes found matching your filters.</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {t('clear')} {t('filters')}
            </button>
          </div>
        )}
      </div>

      {/* Floating Selection Bar */}
      {totalItems > 0 && (
        <div 
          onClick={() => setShowSelections(true)}
          className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg cursor-pointer"
        >
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} />
              <span className="font-medium">{totalItems} {t('items_in_list')}</span>
            </div>
            <span className="text-sm">{t('tap_to_view')}</span>
          </div>
        </div>
      )}

      {/* Selections Modal */}
      {showSelections && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">{t('my_selections')}</h3>
              <button
                onClick={() => setShowSelections(false)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {mySelections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t('no_items_selected')}</p>
              ) : (
                <div className="space-y-3">
                  {mySelections.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.dish_name}</h4>
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-medium">{quantities[item.id] || 1}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="text-right ml-3">
                          {item.price && (
                            <span className="text-sm text-gray-600">
                              {item.currency === 'GBP' ? '£' : item.currency === 'EUR' ? '€' : '$'}{item.price} x {quantities[item.id] || 1}
                            </span>
                          )}
                          <button
                            onClick={() => removeFromSelections(item.id)}
                            className="block text-red-600 hover:text-red-700 mt-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {customisations[item.id] && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>{t('customisation')}:</strong> {customisations[item.id]}
                        </p>
                      )}
                      {questions[item.id] && (
                        <p className="text-sm text-gray-600">
                          <strong>{t('question')}:</strong> {questions[item.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="text-center text-lg font-medium text-gray-700 mb-2">
                {t('show_to_waiter')}
              </div>
              <div className="text-xs text-gray-500 text-center">
                This is a communication tool to help you order
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}