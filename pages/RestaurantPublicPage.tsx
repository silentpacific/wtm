import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

// Mock data for demonstration
const mockRestaurant = {
  id: 1,
  business_name: "Bob's Bistro",
  slug: "bobs-bistro",
  address: "123 High Street, London",
  prices_include_tax: true,
  tips_included: false,
  service_charge_percentage: 12.5,
  special_notes: "Fresh ingredients sourced daily from local markets"
};

const mockDishes = [
  {
    id: 1,
    dish_name: "Grilled Salmon",
    section_name: "Main Courses",
    price: 18.50,
    allergens: ["fish"],
    dietary_tags: ["gluten-free", "dairy-free"],
    description_en: "Fresh Atlantic salmon grilled to perfection with herbs",
    description_es: "Salmón del Atlántico fresco a la parrilla con hierbas",
    description_zh: "新鲜大西洋三文鱼配香草烤制",
    description_fr: "Saumon frais de l'Atlantique grillé aux herbes"
  },
  {
    id: 2,
    dish_name: "Margherita Pizza",
    section_name: "Main Courses", 
    price: 14.00,
    allergens: ["gluten", "dairy"],
    dietary_tags: ["vegetarian"],
    description_en: "Classic pizza with tomato, mozzarella and fresh basil",
    description_es: "Pizza clásica con tomate, mozzarella y albahaca fresca",
    description_zh: "经典番茄马苏里拉芝士新鲜罗勒披萨",
    description_fr: "Pizza classique tomate, mozzarella et basilic frais"
  },
  {
    id: 3,
    dish_name: "Caesar Salad",
    section_name: "Starters",
    price: 9.50,
    allergens: ["dairy", "eggs"],
    dietary_tags: ["vegetarian"],
    description_en: "Crisp romaine lettuce with Caesar dressing and parmesan",
    description_es: "Lechuga romana crujiente con aderezo César y parmesano",
    description_zh: "脆嫩罗马生菜配凯撒酱和帕玛森芝士",
    description_fr: "Laitue romaine croquante avec sauce César et parmesan"
  },
  {
    id: 4,
    dish_name: "Chocolate Tart",
    section_name: "Desserts",
    price: 7.50,
    allergens: ["gluten", "dairy", "eggs"],
    dietary_tags: [],
    description_en: "Rich dark chocolate tart with berry compote",
    description_es: "Tarta de chocolate negro con compota de bayas",
    description_zh: "浓郁黑巧克力挞配浆果果酱",
    description_fr: "Tarte au chocolat noir avec compote de baies"
  }
];

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const allAllergens = ['gluten', 'dairy', 'eggs', 'nuts', 'fish', 'shellfish', 'soy'];
const allDietaryTags = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb'];

export default function RestaurantPage() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showFilters, setShowFilters] = useState(false);
  const [excludeAllergens, setExcludeAllergens] = useState([]);
  const [includeDietary, setIncludeDietary] = useState([]);
  const [mySelections, setMySelections] = useState([]);
  const [showSelections, setShowSelections] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [customisations, setCustomisations] = useState({});
  const [questions, setQuestions] = useState({});

  // Filter dishes based on selected filters
  const filteredDishes = mockDishes.filter(dish => {
    // Exclude dishes with selected allergens
    if (excludeAllergens.length > 0) {
      const hasExcludedAllergen = dish.allergens.some(allergen => 
        excludeAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) return false;
    }

    // Include only dishes with selected dietary tags
    if (includeDietary.length > 0) {
      const hasDietaryTag = includeDietary.every(tag => 
        dish.dietary_tags.includes(tag)
      );
      if (!hasDietaryTag) return false;
    }

    return true;
  });

  // Group dishes by section
  const groupedDishes = filteredDishes.reduce((acc, dish) => {
    if (!acc[dish.section_name]) {
      acc[dish.section_name] = [];
    }
    acc[dish.section_name].push(dish);
    return acc;
  }, {});

  const addToSelections = (dish) => {
    const existingItem = mySelections.find(item => item.id === dish.id);
    if (!existingItem) {
      setMySelections([...mySelections, { ...dish, quantity: 1 }]);
      setQuantities({ ...quantities, [dish.id]: 1 });
    }
  };

  const removeFromSelections = (dishId) => {
    setMySelections(mySelections.filter(item => item.id !== dishId));
    const newQuantities = { ...quantities };
    delete newQuantities[dishId];
    setQuantities(newQuantities);
  };

  const updateQuantity = (dishId, change) => {
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

  const getDescription = (dish) => {
    return dish[`description_${selectedLanguage}`] || dish.description_en;
  };

  const totalItems = mySelections.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">{mockRestaurant.business_name}</h1>
          <p className="text-sm text-gray-600">{mockRestaurant.address}</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pb-20">
        {/* Language Selector Pills */}
        <div className="py-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Choose Language</h3>
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
              Filters
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
                <h4 className="text-sm font-medium text-gray-700 mb-2">Exclude Allergens</h4>
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
                      <span className="text-sm capitalize">{allergen}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Requirements */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Requirements</h4>
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
                      <span className="text-sm capitalize">{tag.replace('-', ' ')}</span>
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
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Restaurant Info */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Prices include tax: {mockRestaurant.prices_include_tax ? 'Yes' : 'No'}</p>
            <p>• Service charge: {mockRestaurant.service_charge_percentage}%</p>
            <p>• {mockRestaurant.special_notes}</p>
          </div>
        </div>

        {/* Menu Sections */}
        {Object.entries(groupedDishes).map(([sectionName, dishes]) => (
          <div key={sectionName} className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{sectionName}</h2>
            <div className="space-y-3">
              {dishes.map((dish) => {
                const isInSelections = mySelections.some(item => item.id === dish.id);
                const quantity = quantities[dish.id] || 1;
                
                return (
                  <div key={dish.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    {/* Dish Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{dish.dish_name}</h3>
                      <span className="text-lg font-bold text-blue-600">£{dish.price}</span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-3">{getDescription(dish)}</p>

                    {/* Allergens & Dietary Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {dish.allergens.map((allergen) => (
                        <span key={allergen} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                          ⚠️ {allergen}
                        </span>
                      ))}
                      {dish.dietary_tags.map((tag) => (
                        <span key={tag} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          ✓ {tag.replace('-', ' ')}
                        </span>
                      ))}
                    </div>

                    {/* Customisation */}
                    <textarea
                      placeholder="Any customisation requests..."
                      value={customisations[dish.id] || ''}
                      onChange={(e) => setCustomisations({...customisations, [dish.id]: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded text-sm mb-2 resize-none h-16"
                    />

                    {/* Question for Kitchen */}
                    <textarea
                      placeholder="Question for kitchen..."
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
                        Add to My List
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
                          className="text-red-600 font-medium hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
              <span className="font-medium">{totalItems} items in your list</span>
            </div>
            <span className="text-sm">Tap to view</span>
          </div>
        </div>
      )}

      {/* Selections Modal */}
      {showSelections && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full max-h-[80vh] rounded-t-xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">My Selections</h3>
              <button
                onClick={() => setShowSelections(false)}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {mySelections.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items selected</p>
              ) : (
                <div className="space-y-3">
                  {mySelections.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.dish_name}</h4>
                        <span className="text-sm text-gray-600">£{item.price} x {item.quantity}</span>
                      </div>
                      {customisations[item.id] && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Customisation:</strong> {customisations[item.id]}
                        </p>
                      )}
                      {questions[item.id] && (
                        <p className="text-sm text-gray-600">
                          <strong>Question:</strong> {questions[item.id]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700">
                Show This to Your Waiter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}