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

  // Fetch dish explanation from database
  const fetchDishFromDatabase = async (dishName: string, language: string): Promise<DishExplanation> => {
    console.log(`🔍 Demo: Fetching dish "${dishName}" in language "${language}" from database...`);
    
    const { data, error } = await supabase
      .from('dishes')
      .select('*')
      .eq('name', dishName)
      .eq('language', language)
      .eq('restaurant_name', 'Brasserie Française')
      .single();

    if (error) {
      console.error('❌ Demo: Database error:', error);
      throw new Error(`Failed to fetch dish explanation: ${error.message}`);
    }

    if (!data) {
      console.error('❌ Demo: No data found for dish');
      throw new Error('Dish explanation not found in database');
    }

    console.log('✅ Demo: Successfully fetched from database:', data);

    // Transform database result to match DishExplanation interface
    return {
      explanation: data.explanation || '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      allergens: Array.isArray(data.allergens) ? data.allergens : [],
      cuisine: data.cuisine || 'French'
    };
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

  const formatAllergens = (allergens: string[]): string => {
    if (allergens.length === 0 || (allergens.length === 1 && allergens[0] === "None")) {
      return currentLanguage === 'en' ? 'No common allergens' :
             currentLanguage === 'es' ? 'Sin alérgenos comunes' :
             currentLanguage === 'zh' ? '无常见过敏原' :
             'Aucun allergène commun';
    }
    return allergens.join(', ');
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
    
    };

export default DemoSection;
    <>
      {/* Section Separator */}
      <div className="bg-charcoal-800 py-2">
        <div className="container mx-auto px-4">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-charcoal-600 to-transparent"></div>
        </div>
      </div>