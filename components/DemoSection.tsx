import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

// Import the DishExplanation type from your types file
interface DishExplanation {
  explanation: string;
  tags: string[];
  allergens: string[];
  cuisine: string;
}

// Sample menu data extracted from the provided French menu
const SAMPLE_MENU_DATA = {
  restaurant: {
    name: "Brasserie Française",
    cuisine: "French"
  },
  dishes: [
    {
      name: "STEAK D'ESPADON AU POIVRE VERT",
      originalName: "STEAK D'ESPADON AU POIVRE VERT, FRITES",
      section: "LES PLATS"
    },
    {
      name: "COQ AU VIN, PÂTES FRAÎCHES", 
      originalName: "COQ AU VIN, PÂTES FRAÎCHES",
      section: "LES PLATS"
    },
    {
      name: "OSSO BUCO D'AGNEAU À LA PROVENÇALE",
      originalName: "OSSO BUCO D'AGNEAU À LA PROVENÇALE",
      section: "LES PLATS"
    },
    {
      name: "CHOUCROUTE GARNIE ALSACIENNE",
      originalName: "CHOUCROUTE GARNIE ALSACIENNE", 
      section: "LES CLASSIQUES"
    },
    {
      name: "CASSOULET TOULOUSAIN",
      originalName: "CASSOULET TOULOUSAIN",
      section: "LES CLASSIQUES"
    },
    {
      name: "FOIE DE VEAU À LA PROVENÇALE",
      originalName: "FOIE DE VEAU À LA PROVENÇALE",
      section: "LES CLASSIQUES"
    },
    {
      name: "ESCARGOTS DE BOURGOGNE",
      originalName: "ESCARGOTS DE BOURGOGNE",
      section: "POUR COMMENCER"
    },
    {
      name: "COCKTAIL DE CREVETTES CLASSIQUE",
      originalName: "COCKTAIL DE CREVETTES CLASSIQUE",
      section: "POUR COMMENCER"
    }
  ]
};

interface ExplanationState {
  [dishName: string]: {
    [language: string]: {
      data: DishExplanation | null;
      isLoading: boolean;
      error: string | null;
    };
  };
}

interface DemoSectionProps {
  selectedLanguage?: string;
}

const DemoSection: React.FC<DemoSectionProps> = ({ selectedLanguage = 'en' }) => {
  const [clickedDishes, setClickedDishes] = useState<Set<string>>(new Set());
  const [loadingDishes, setLoadingDishes] = useState<Set<string>>(new Set());
  const [explanations, setExplanations] = useState<ExplanationState>({});
  const [currentLanguage, setCurrentLanguage] = useState(selectedLanguage);
  
  // Add this useEffect to reset visual state when language changes
  useEffect(() => {
    setClickedDishes(new Set());
  }, [currentLanguage]);

  // Simple string similarity function to avoid external dependency
  const calculateSimilarity = (str1: string, str2: string): number => {
    const cleanString = (str: string) => str.toLowerCase().replace(/[.,!?;:"()[\]{}]/g, '').replace(/\s+/g, ' ').trim();
    
    const clean1 = cleanString(str1);
    const clean2 = cleanString(str2);
    
    if (clean1 === clean2) return 1.0;
    
    // Check if one string contains the other
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8;
    
    // Simple word matching
    const words1 = clean1.split(' ');
    const words2 = clean2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  };

  // Fetch dish explanation from database
  const fetchDishFromDatabase = async (dishName: string, language: string): Promise<DishExplanation> => {
    console.log(`🔍 Demo: Fetching dish "${dishName}" in language "${language}" from database...`);
    
    try {
      // Get dishes for the specific language
      const { data: dishes, error } = await supabase.rpc('get_dishes_by_language', { 
        p_language: language 
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!dishes || dishes.length === 0) {
        throw new Error(`No dishes found for language: ${language}`);
      }

      console.log(`📊 Found ${dishes.length} dishes in ${language}`);

      // Find the best match using similarity
      let bestMatch = null;
      let bestScore = 0;

      for (const dish of dishes) {
        if (dish.name) {
          const score = calculateSimilarity(dishName, dish.name);
          console.log(`🎯 Comparing "${dishName}" with "${dish.name}": ${score.toFixed(3)}`);
          
          if (score > bestScore && score > 0.6) {
            bestScore = score;
            bestMatch = dish;
          }
        }
      }

      if (!bestMatch) {
        console.log('❌ No good match found. Available dishes:', dishes.slice(0, 5).map(d => d.name));
        throw new Error(`Dish "${dishName}" not found in database for ${language}`);
      }

      console.log(`✅ Best match: "${bestMatch.name}" with score ${bestScore.toFixed(3)}`);

      return {
        explanation: bestMatch.explanation || '',
        tags: Array.isArray(bestMatch.tags) ? bestMatch.tags : [],
        allergens: Array.isArray(bestMatch.allergens) ? bestMatch.allergens : [],
        cuisine: bestMatch.cuisine || 'French'
      };

    } catch (error) {
      console.error(`❌ Error in fetchDishFromDatabase:`, error);
      throw error;
    }
  };

  const handleDishClick = async (dishName: string) => {
    if (loadingDishes.has(dishName)) return;

    // If already clicked, toggle it off
    if (clickedDishes.has(dishName)) {
      setClickedDishes(prev => {
        const newSet = new Set(prev);
        newSet.delete(dishName);
        return newSet;
      });
      return;
    }

    // Check if we already have data for this dish in this language
    if (explanations[dishName]?.[currentLanguage]?.data) {
      setClickedDishes(prev => new Set(prev).add(dishName));
      return;
    }

    // Add to loading state
    setLoadingDishes(prev => new Set(prev).add(dishName));

    // Initialize explanation state if needed
    if (!explanations[dishName]) {
      explanations[dishName] = {};
    }

    // Set loading state
    setExplanations(prev => ({
      ...prev,
      [dishName]: {
        ...prev[dishName],
        [currentLanguage]: { data: null, isLoading: true, error: null }
      }
    }));

    // Simulate 2 second delay, then fetch from database
    setTimeout(async () => {
      try {
        console.log(`🎭 Demo: Starting database fetch for ${dishName} in ${currentLanguage}`);
        
        const data = await fetchDishFromDatabase(dishName, currentLanguage);

        console.log(`✅ Demo: Successfully got explanation for ${dishName}:`, data);

        // Update state with successful data
        setExplanations(prev => ({
          ...prev,
          [dishName]: {
            ...prev[dishName],
            [currentLanguage]: { data, isLoading: false, error: null }
          }
        }));

        // Add to clicked dishes
        setClickedDishes(prev => new Set(prev).add(dishName));

      } catch (error) {
        console.error(`❌ Demo: Error fetching ${dishName}:`, error);
        
        let errorMessage = 'Failed to get explanation. Please try again.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setExplanations(prev => ({
          ...prev,
          [dishName]: {
            ...prev[dishName],
            [currentLanguage]: { data: null, isLoading: false, error: errorMessage }
          }
        }));
      } finally {
        setLoadingDishes(prev => {
          const newSet = new Set(prev);
          newSet.delete(dishName);
          return newSet;
        });
      }
    }, 2000); // 2 second delay as requested
  };

  const getDishExplanation = (dishName: string) => {
    return explanations[dishName]?.[currentLanguage];
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get translation text based on current language
  const getTranslationText = (key: string) => {
    const translations = {
      en: {
        explaining: 'Explaining...',
        dietaryStyle: 'Dietary & Style',
        allergenInfo: 'Allergen Information'
      },
      es: {
        explaining: 'Explicando...',
        dietaryStyle: 'Dieta y Estilo',
        allergenInfo: 'Información de Alérgenos'
      },
      zh: {
        explaining: '解释中...',
        dietaryStyle: '饮食与风格',
        allergenInfo: '过敏原信息'
      },
      fr: {
        explaining: 'Explication...',
        dietaryStyle: 'Régime et Style',
        allergenInfo: 'Informations Allergènes'
      }
    };

    return translations[currentLanguage as keyof typeof translations]?.[key as keyof typeof translations.en] || translations.en[key as keyof typeof translations.en];
  };

  // Render explanation content using the same logic as HomePage
  const renderExplanationContent = (dish: any) => {
    const dishExplanation = getDishExplanation(dish.name);
    
    if (dishExplanation?.isLoading) {
      return (
        <div className="flex items-center space-x-2 font-medium">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-coral"></div>
          <span>{getTranslationText('explaining')}</span>
        </div>
      );
    }
    
    if (dishExplanation?.error) {
      return (
        <div className="space-y-2">
          <div className="p-3 rounded-lg border-2 bg-red-50 border-red-200 text-red-700">
            <div className="flex items-start space-x-2">
              <span className="text-lg flex-shrink-0">❌</span>
              <div>
                <p className="font-medium text-sm">
                  {dishExplanation.error}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (dishExplanation?.data) {
      return (
        <div className="space-y-4">
          <p className="font-medium text-lg">{dishExplanation.data.explanation}</p>
          
          {/* Tags Section - using same styling as HomePage */}
          {dishExplanation.data.tags && dishExplanation.data.tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-charcoal/70 uppercase tracking-wide">
                {getTranslationText('dietaryStyle')}
              </p>
              <div className="flex flex-wrap gap-2">
                {dishExplanation.data.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className="px-2 py-1 text-xs font-bold bg-teal/20 text-teal-800 rounded-full border border-teal/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Section - using same styling as HomePage */}
          {dishExplanation.data.allergens && dishExplanation.data.allergens.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                ⚠️ {getTranslationText('allergenInfo')}
              </p>
              <div className="flex flex-wrap gap-2">
                {dishExplanation.data.allergens.map((allergen, allergenIndex) => (
                  <span 
                    key={allergenIndex}
                    className="px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full border border-red-200"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <>
      {/* Section Separator */}
      <div className="bg-charcoal-800 py-2">
        <div className="container mx-auto px-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-charcoal-600 to-transparent"></div>
        </div>
      </div>

      <section className="py-4 bg-gradient-to-br from-cream-50 to-cream-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-charcoal-800 mb-4">
              See How It Works
            </h2>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              See us work our magic on a French menu in real-time. Click on any dish to get a description and allergen information.
            </p>
          </div>

          {/* Centered iPhone Frame */}
          <div className="flex justify-center">
            <div className="relative mx-4">
              {/* iPhone Frame */}
              <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl" style={{ width: '375px', height: '812px' }}>
                {/* Screen */}
                <div className="bg-white rounded-[2.5rem] w-full h-full overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-white px-6 py-3 flex justify-between items-center text-black text-sm font-medium">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                      <svg className="w-6 h-4 ml-1" viewBox="0 0 24 16" fill="none">
                        <rect x="1" y="3" width="22" height="10" rx="2" stroke="black" strokeWidth="1" fill="none"/>
                        <rect x="2" y="4" width="18" height="8" fill="black" rx="1"/>
                        <rect x="23" y="6" width="1" height="4" fill="black" rx="0.5"/>
                      </svg>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="flex-1 overflow-hidden bg-gradient-to-br from-cream-50 to-cream-100">
                    {/* Header */}
                    <div className="bg-white shadow-sm px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-center">
                        <h1 className="text-lg font-bold text-charcoal-800">Menu Results</h1>
                      </div>
                      
                      {/* Restaurant Info */}
                      <div className="mt-2 text-center">
                        <h2 className="text-lg font-semibold text-charcoal-700">{SAMPLE_MENU_DATA.restaurant.name}</h2>
                        <span className="inline-block bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                          {SAMPLE_MENU_DATA.restaurant.cuisine} Cuisine
                        </span>
                      </div>

                      {/* Language Pills */}
                      <div className="mt-3 flex justify-center gap-2">
                        {[
                          { code: 'en', label: 'English' },
                          { code: 'es', label: 'Español' },
                          { code: 'zh', label: '中文' },
                          { code: 'fr', label: 'Français' }
                        ].map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => setCurrentLanguage(lang.code)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              currentLanguage === lang.code
                                ? 'bg-gray-800 text-white'
                                : 'bg-gray-200 text-charcoal-600 hover:bg-gray-300'
                            }`}
                          >
                            {lang.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Important Notice */}
                    <div className="p-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-red-800 font-medium">
                              Important: Always double-check with the restaurant about allergens and ingredients. AI descriptions are for guidance only.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable Menu Results */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ height: 'calc(100vh - 300px)' }}>
                      <div className="space-y-3">
                        {SAMPLE_MENU_DATA.dishes.map((dish, index) => {
                          const isClicked = clickedDishes.has(dish.name);
                          const isLoading = loadingDishes.has(dish.name);

                          return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                              {/* Dish Header */}
                              <div 
                                className={`p-4 cursor-pointer transition-all duration-200 ${
                                  isLoading ? 'bg-gray-50' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleDishClick(dish.name)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1 pr-3">
                                    <h3 className="font-semibold text-charcoal-800 text-sm leading-snug">
                                      {dish.name}
                                    </h3>
                                  </div>
                                  <div className="flex-shrink-0 ml-2">
                                    {isLoading ? (
                                      <div className="animate-spin w-5 h-5 border-2 border-coral-500 border-t-transparent rounded-full"></div>
                                    ) : (
                                      <svg 
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                          isClicked ? 'rotate-180' : ''
                                        }`} 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Explanation */}
                              {isClicked && (
                                <div className="border-t border-gray-200 bg-gray-50 p-4 animate-fadeIn">
                                  {renderExplanationContent(dish)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Bottom spacing for scroll */}
                      <div className="h-20"></div>
                    </div>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl"></div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <button 
              onClick={scrollToTop}
              className="bg-coral-500 hover:bg-coral-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-brutal hover:shadow-brutal-hover transform hover:scale-105"
            >
              Try The Real Thing Now
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </section>
    </>
  );
};

export default DemoSection;