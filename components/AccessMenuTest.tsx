import React, { useEffect, useState, useMemo } from 'react';
import { getAccessMenu, AccessMenu, AccessMenuDish } from '../services/accessMenuService';
import { translateDietaryTag, translateAllergen, formatPrice } from '../services/accessMenuTranslationService';
import AccessMenuLanguageSelector from './AccessMenuLanguageSelector';
import AccessMenuFilterBar from './AccessMenuFilterBar';
import AccessMenuDishExplanation from './AccessMenuDishExplanation';
import AccessMenuStickyOrderBar from './AccessMenuStickyOrderBar';
import AccessMenuOrderDrawer from './AccessMenuOrderDrawer';
import { VisualInstructionBanner, EnhancedServerResponse, VisualOrderSummary } from './EnhancedVisualComponents';

export type ServerResponseState = 'pending' | 'yes' | 'no' | 'checking';

interface OrderItem {
  dishId: number;
  dishName: Record<string, string>;
  price: number;
  quantity: number;
  note: string;
  serverResponse?: ServerResponseState;
}

type AppState = 'menu' | 'server' | 'final';

// Translation dictionary for UI elements
const uiTranslations: Record<string, Record<string, string>> = {
  'whats_this': {
    en: 'What\'s this?',
    zh: '这是什么？',
    es: '¿Qué es esto?',
    fr: 'Qu\'est-ce que c\'est ?'
  },
  'learn_more_about': {
    en: 'Learn more about',
    zh: '了解更多关于',
    es: 'Aprende más sobre',
    fr: 'En savoir plus sur'
  },
  'add_note_placeholder': {
    en: 'Add a note or ask a question (English)',
    zh: 'Add a note or ask a question (English)',
    es: 'Add a note or ask a question (English)',
    fr: 'Add a note or ask a question (English)'
  },
  'add_to_order': {
    en: 'Add to Order',
    zh: '添加到订单',
    es: 'Añadir al Pedido',
    fr: 'Ajouter à la Commande'
  },
  'added_to_order': {
    en: 'Added to Order',
    zh: '已添加到订单',
    es: 'Añadido al Pedido',
    fr: 'Ajouté à la Commande'
  }
};

const getTranslation = (key: string, language: string): string => {
  return uiTranslations[key]?.[language] || uiTranslations[key]?.en || key;
};

const AccessMenuTest: React.FC = () => {
  const [menu, setMenu] = useState<AccessMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [selectedDish, setSelectedDish] = useState<AccessMenuDish | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dishNotes, setDishNotes] = useState<Record<number, string>>({});
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [appState, setAppState] = useState<AppState>('menu');

  useEffect(() => {
    const fetchMenu = async () => {
      const result = await getAccessMenu(1);
      setMenu(result);
      setLoading(false);
    };

    fetchMenu();
  }, []);

  // Get all unique allergens and dietary tags
  const { availableAllergens, availableDietaryTags } = useMemo(() => {
    if (!menu) return { availableAllergens: [], availableDietaryTags: [] };
    
    const allergens = new Set<string>();
    const dietaryTags = new Set<string>();
    
    menu.dishes.forEach(dish => {
      dish.allergens.forEach(allergen => allergens.add(allergen));
      dish.dietary_tags.forEach(tag => dietaryTags.add(tag));
    });
    
    return {
      availableAllergens: Array.from(allergens),
      availableDietaryTags: Array.from(dietaryTags)
    };
  }, [menu]);

  // Filter dishes based on selected filters
  const filteredDishes = useMemo(() => {
    if (!menu) return [];
    
    return menu.dishes.filter(dish => {
      // Exclude dishes with selected allergens
      if (selectedAllergens.some(allergen => dish.allergens.includes(allergen))) {
        return false;
      }
      
      // Include only dishes that have ALL selected dietary tags
      if (selectedDietaryTags.length > 0) {
        return selectedDietaryTags.every(tag => dish.dietary_tags.includes(tag));
      }
      
      return true;
    });
  }, [menu, selectedAllergens, selectedDietaryTags]);

  // Group filtered dishes by section
  const groupedDishes = filteredDishes.reduce((groups, dish) => {
    const sectionName = dish.section_name[currentLanguage] || dish.section_name.en;
    if (!groups[sectionName]) {
      groups[sectionName] = [];
    }
    groups[sectionName].push(dish);
    return groups;
  }, {} as Record<string, typeof filteredDishes>);

  // Calculate question status
  const questionsWithAnswers = orderItems.filter(item => 
    item.note && (item.serverResponse === 'yes' || item.serverResponse === 'no')
  );
  const totalQuestions = orderItems.filter(item => item.note).length;
  const allQuestionsAnswered = totalQuestions === 0 || (totalQuestions > 0 && questionsWithAnswers.length === totalQuestions);

  const handleAllergenToggle = (allergen: string) => {
    setSelectedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const handleDietaryTagToggle = (tag: string) => {
    setSelectedDietaryTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedAllergens([]);
    setSelectedDietaryTags([]);
  };

  const handleNoteChange = (dishId: number, note: string) => {
    setDishNotes(prev => ({
      ...prev,
      [dishId]: note
    }));
  };

  const handleAddToOrder = (dish: AccessMenuDish) => {
    const note = dishNotes[dish.id] || '';
    
    // Check if dish already in order
    const existingItemIndex = orderItems.findIndex(item => item.dishId === dish.id && item.note === note);
    
    if (existingItemIndex >= 0) {
      // Increase quantity
      setOrderItems(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // Add new item
      const newItem: OrderItem = {
        dishId: dish.id,
        dishName: dish.dish_name,
        price: dish.price,
        quantity: 1,
        note: note,
        serverResponse: note ? 'pending' : undefined
      };
      setOrderItems(prev => [...prev, newItem]);
    }
  };

  const handleOpenOrderDrawer = () => {
    setIsOrderDrawerOpen(true);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(index);
    } else {
      setOrderItems(prev => prev.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleShowToWaiter = () => {
    setAppState('server');
  };

  const handleFinalizeOrder = () => {
    setAppState('final');
  };

  const handleBackToMenu = () => {
    setAppState('menu');
    setIsOrderDrawerOpen(false);
  };

  const handleServerResponse = (itemIndex: number, response: ServerResponseState) => {
    setOrderItems(prev => prev.map((item, index) => 
      index === itemIndex 
        ? { ...item, serverResponse: response }
        : item
    ));
  };

  // Auto-return from server mode when all questions answered
  useEffect(() => {
    if (appState === 'server' && allQuestionsAnswered && totalQuestions > 0) {
      setTimeout(() => {
        setAppState('menu');
        setIsOrderDrawerOpen(true);
      }, 1000); // Small delay to show completion
    }
  }, [appState, allQuestionsAnswered, totalQuestions]);

  if (loading) return (
    <div className="pt-8 p-4" role="status" aria-live="polite">
      <div className="text-center">Loading menu...</div>
    </div>
  );
  
  if (!menu) return (
    <div className="pt-8 p-4" role="alert">
      <div className="text-center">No menu found</div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step 1: Menu View */}
      {appState === 'menu' && (
        <main className="pt-8 p-4 pb-20" role="main">
          <header>
            <h1 className="text-3xl font-bold mb-4 text-gray-900" id="menu-title">
              {menu.name}
            </h1>
          </header>
          
          <section aria-labelledby="language-selector-heading">
            <h2 id="language-selector-heading" className="sr-only">
              Language Selection
            </h2>
            <AccessMenuLanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
            />
          </section>
          
          <section aria-labelledby="filters-heading">
            <AccessMenuFilterBar
              selectedAllergens={selectedAllergens}
              selectedDietaryTags={selectedDietaryTags}
              onAllergenToggle={handleAllergenToggle}
              onDietaryTagToggle={handleDietaryTagToggle}
              onClearFilters={handleClearFilters}
              currentLanguage={currentLanguage}
              availableAllergens={availableAllergens}
              availableDietaryTags={availableDietaryTags}
            />
          </section>

          <section aria-labelledby="menu-items-heading">
            <h2 id="menu-items-heading" className="sr-only">
              Menu Items
            </h2>
            
            {Object.keys(groupedDishes).length === 0 ? (
              <div className="text-center py-8 text-gray-800" role="status" aria-live="polite">
                <p className="text-lg font-medium">No dishes match your current filters.</p>
                <p className="text-base mt-2">Try removing some filters to see more options.</p>
              </div>
            ) : (
              Object.entries(groupedDishes).map(([sectionName, dishes]) => (
                <section key={sectionName} className="mb-8" aria-labelledby={`section-${sectionName.replace(/\s+/g, '-').toLowerCase()}`}>
                  <h3 id={`section-${sectionName.replace(/\s+/g, '-').toLowerCase()}`} className="text-2xl font-bold mb-4 text-gray-900 border-b-2 border-gray-400 pb-2">
                    {sectionName}
                  </h3>
                  
                  <div className="space-y-4" role="list">
                    {dishes.map(dish => (
                      <article 
                        key={dish.id} 
                        className="border border-gray-300 p-4 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                        role="listitem"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-lg">
                            {dish.dish_name[currentLanguage] || dish.dish_name.en}
                          </h4>
                          <button
                            onClick={() => setSelectedDish(dish)}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 focus:bg-blue-200 text-sm px-3 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center ml-2 border border-blue-300"
                            aria-label={`${getTranslation('learn_more_about', currentLanguage)} ${dish.dish_name[currentLanguage] || dish.dish_name.en}`}
                          >
                            <span className="mr-1" aria-hidden="true">ℹ️</span>
                            {getTranslation('whats_this', currentLanguage)}
                          </button>
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          {dish.description[currentLanguage] || dish.description.en}
                        </p>
                        
                        <p className="font-semibold text-lg mb-2" aria-label={`Price: ${formatPrice(dish.price, currentLanguage)}`}>
                          {formatPrice(dish.price, currentLanguage)}
                        </p>
                        
                        {dish.allergens.length > 0 && (
                          <div className="mt-2" role="alert">
                            <span className="text-red-800 text-base font-semibold">
                              <span className="sr-only">Warning: Contains allergens:</span>
                              ⚠️ Allergens: {dish.allergens.map(allergen => 
                                translateAllergen(allergen, currentLanguage)
                              ).join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {dish.dietary_tags.length > 0 && (
                          <div className="mt-1">
                            <span className="text-green-800 text-base font-semibold">
                              <span className="sr-only">Dietary information:</span>
                              🌱 {dish.dietary_tags.map(tag => 
                                translateDietaryTag(tag, currentLanguage)
                              ).join(', ')}
                            </span>
                          </div>
                        )}

                        {/* Note Input */}
                        <div className="mt-3">
                          <label htmlFor={`note-${dish.id}`} className="sr-only">
                            Add a note or question for {dish.dish_name[currentLanguage] || dish.dish_name.en}
                          </label>
                          <input
                            id={`note-${dish.id}`}
                            type="text"
                            placeholder={getTranslation('add_note_placeholder', currentLanguage)}
                            value={dishNotes[dish.id] || ''}
                            onChange={(e) => handleNoteChange(dish.id, e.target.value)}
                            maxLength={160}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none min-h-[44px]"
                            aria-describedby={dishNotes[dish.id] ? `note-count-${dish.id}` : undefined}
                          />
                          {dishNotes[dish.id] && (
                            <div id={`note-count-${dish.id}`} className="text-xs text-gray-500 mt-1" aria-live="polite">
                              {dishNotes[dish.id].length} of 160 characters used
                            </div>
                          )}
                        </div>

                        {/* Add to Order Button */}
                        <button
                          onClick={() => handleAddToOrder(dish)}
                          className={`w-full mt-3 py-2 px-4 rounded-lg font-medium min-h-[44px] transition-all ${
                            orderItems.some(item => item.dishId === dish.id)
                              ? 'bg-gray-600 text-white'
                              : 'bg-green-600 text-white hover:bg-green-700 focus:bg-green-700'
                          } focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                          aria-label={`${orderItems.some(item => item.dishId === dish.id) ? getTranslation('added_to_order', currentLanguage) : getTranslation('add_to_order', currentLanguage)} ${dish.dish_name[currentLanguage] || dish.dish_name.en} ${formatPrice(dish.price, currentLanguage)}`}
                        >
                          {orderItems.some(item => item.dishId === dish.id) ? (
                            <>
                              <span aria-hidden="true">✓ </span>{getTranslation('added_to_order', currentLanguage)}
                            </>
                          ) : (
                            <>
                              <span aria-hidden="true">+ </span>{getTranslation('add_to_order', currentLanguage)}
                            </>
                          )}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ))
            )}
          </section>

          <AccessMenuStickyOrderBar
            orderItems={orderItems}
            currentLanguage={currentLanguage}
            onOpenOrderDrawer={handleOpenOrderDrawer}
          />

          {/* Order Drawer - Step 2 & 4 */}
          <AccessMenuOrderDrawer
            isOpen={isOrderDrawerOpen}
            onClose={() => setIsOrderDrawerOpen(false)}
            orderItems={orderItems}
            currentLanguage={currentLanguage}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onShowToServer={handleShowToWaiter}
            onFinalizeOrder={handleFinalizeOrder}
            allQuestionsAnswered={allQuestionsAnswered}
          />
        </main>
      )}

      {/* Step 3: Server Mode */}
      {appState === 'server' && (
        <main className="pt-8 p-4" role="main">
          <VisualInstructionBanner 
            step="server-answering" 
            questionProgress={{ 
              answered: questionsWithAnswers.length, 
              total: totalQuestions 
            }} 
          />

          <section aria-labelledby="customer-questions-heading">
            <h2 id="customer-questions-heading" className="sr-only">
              Customer Questions to Answer
            </h2>
            
            <div className="space-y-6 mb-6">
              {orderItems.map((item, index) => (
                <article key={`${item.dishId}-${index}`} className="bg-white border-4 border-gray-300 rounded-xl p-6 shadow-lg">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {item.dishName.en}
                    </h3>
                    <div className="bg-blue-100 rounded-lg p-3 border-2 border-blue-300">
                      <div className="text-sm text-blue-700 font-medium">Order Details</div>
                      <div className="text-lg font-bold text-blue-800">
                        Quantity: {item.quantity} • {formatPrice(item.price * item.quantity, 'en')}
                      </div>
                    </div>
                  </div>
                  
                  {item.note && (
                    <EnhancedServerResponse
                      questionText={item.note}
                      onResponse={(response) => handleServerResponse(index, response)}
                      currentResponse={item.serverResponse}
                      isLocked={item.serverResponse === 'yes' || item.serverResponse === 'no'}
                    />
                  )}
                </article>
              ))}
            </div>

            {allQuestionsAnswered && totalQuestions > 0 && (
              <div className="bg-green-50 border-4 border-green-400 rounded-xl p-6 text-center shadow-lg" role="status" aria-live="polite">
                <div className="text-4xl mb-3" aria-hidden="true">🎉</div>
                <div className="text-xl font-bold text-green-800 mb-2">
                  Perfect! All Questions Answered
                </div>
                <div className="text-green-700">
                  Returning to customer's order in 3 seconds...
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleBackToMenu}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold border-2 border-green-700 min-h-[50px]"
                  >
                    Continue Now →
                  </button>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Step 5: Final Order */}
      {appState === 'final' && (
        <main className="pt-8 p-4" role="main">
          <VisualInstructionBanner step="final-order" />
          
          <VisualOrderSummary 
            orderItems={orderItems}
            showTotal={true}
            language="en"
            title="FINAL ORDER"
          />

          <section className="mt-6">
            {/* Show questions and answers if any exist */}
            {orderItems.some(item => item.note && item.serverResponse) && (
              <div className="bg-blue-50 border-4 border-blue-300 rounded-xl p-4 mb-6">
                <h3 className="text-lg font-bold text-center mb-4 text-blue-800">
                  📝 Questions & Answers
                </h3>
                <div className="space-y-3">
                  {orderItems.map((item, index) => 
                    item.note && item.serverResponse ? (
                      <div key={`qa-${item.dishId}-${index}`} className="bg-white border-2 border-gray-200 rounded-lg p-3">
                        <div className="font-medium text-gray-800 mb-1">
                          Q: {item.note}
                        </div>
                        <div className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                          item.serverResponse === 'yes' 
                            ? 'bg-green-100 text-green-800 border-2 border-green-400' 
                            : 'bg-red-100 text-red-800 border-2 border-red-400'
                        }`}>
                          <span className="text-lg mr-2" aria-hidden="true">
                            {item.serverResponse === 'yes' ? '✓' : '✗'}
                          </span>
                          A: {item.serverResponse === 'yes' ? 'YES' : 'NO'}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            )}

            <div className="text-center space-y-4">
              <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-4">
                <div className="text-sm text-gray-600 mb-2">Need to place another order?</div>
                <button
                  onClick={() => {
                    setAppState('menu');
                    setOrderItems([]);
                    setDishNotes({});
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold border-2 border-blue-700 min-h-[50px]"
                >
                  🔄 Start New Order
                </button>
              </div>
            </div>
          </section>
        </main>
      )}

      {selectedDish && (
        <AccessMenuDishExplanation
          dish={selectedDish}
          currentLanguage={currentLanguage}
          isOpen={!!selectedDish}
          onClose={() => setSelectedDish(null)}
        />
      )}
    </div>
  );
};

export default AccessMenuTest;