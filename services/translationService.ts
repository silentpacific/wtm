// =============================================
// FILE: services/translationService.ts
// =============================================

interface TranslationCache {
  [language: string]: {
    [key: string]: string;
  };
}

class TranslationService {
  private cache: TranslationCache = {};
  private allergenCache: TranslationCache = {};
  private dietaryTagCache: TranslationCache = {};
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  // Fetch UI translations
  async getTranslations(language: string, category?: string): Promise<{ [key: string]: string }> {
    const cacheKey = `${language}_${category || 'all'}`;
    
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }

    try {
      const params = new URLSearchParams({ language });
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`${this.baseUrl}/getTranslations?${params}`);
      
      if (!response.ok) {
        throw new Error(`Translation fetch failed: ${response.status}`);
      }

      const translations = await response.json();
      this.cache[cacheKey] = translations;
      return translations;
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      // Return English fallbacks for critical UI elements
      return this.getEnglishFallbacks();
    }
  }

  // Fetch allergen translations
  async getAllergenTranslations(language: string): Promise<{ [key: string]: string }> {
    if (this.allergenCache[language]) {
      return this.allergenCache[language];
    }

    try {
      const response = await fetch(`${this.baseUrl}/getAllergenTranslations?language=${language}`);
      
      if (!response.ok) {
        throw new Error(`Allergen translation fetch failed: ${response.status}`);
      }

      const translations = await response.json();
      this.allergenCache[language] = translations;
      return translations;
    } catch (error) {
      console.error('Failed to fetch allergen translations:', error);
      return this.getEnglishAllergenFallbacks();
    }
  }

  // Fetch dietary tag translations
  async getDietaryTagTranslations(language: string): Promise<{ [key: string]: string }> {
    if (this.dietaryTagCache[language]) {
      return this.dietaryTagCache[language];
    }

    try {
      const response = await fetch(`${this.baseUrl}/getDietaryTagTranslations?language=${language}`);
      
      if (!response.ok) {
        throw new Error(`Dietary tag translation fetch failed: ${response.status}`);
      }

      const translations = await response.json();
      this.dietaryTagCache[language] = translations;
      return translations;
    } catch (error) {
      console.error('Failed to fetch dietary tag translations:', error);
      return this.getEnglishDietaryTagFallbacks();
    }
  }

  // Get single translation with fallback
  async t(key: string, language: string, category?: string): Promise<string> {
    const translations = await this.getTranslations(language, category);
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Get translated allergen name
  async getAllergenName(allergenKey: string, language: string): Promise<string> {
    const translations = await this.getAllergenTranslations(language);
    return translations[allergenKey] || allergenKey.charAt(0).toUpperCase() + allergenKey.slice(1);
  }

  // Get translated dietary tag name
  async getDietaryTagName(tagKey: string, language: string): Promise<string> {
    const translations = await this.getDietaryTagTranslations(language);
    return translations[tagKey] || tagKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // Clear cache (useful for language switching)
  clearCache(): void {
    this.cache = {};
    this.allergenCache = {};
    this.dietaryTagCache = {};
  }

  // English fallbacks for critical UI elements
  private getEnglishFallbacks(): { [key: string]: string } {
    return {
      'choose_language': 'Choose Language',
      'filters': 'Filters',
      'exclude_allergens': 'Exclude Allergens',
      'dietary_requirements': 'Dietary Requirements',
      'apply_filters': 'Apply Filters',
      'clear': 'Clear',
      'prices_include_tax': 'Prices include tax',
      'service_charge': 'Service charge',
      'yes': 'Yes',
      'no': 'No',
      'add_to_list': 'Add to My List',
      'remove': 'Remove',
      'my_selections': 'My Selections',
      'no_items_selected': 'No items selected',
      'tap_to_view': 'Tap to view',
      'items_in_list': 'items in your list',
      'customisation': 'Customisation',
      'question': 'Question',
      'any_customisation': 'Any customisation requests...',
      'question_for_kitchen': 'Question for kitchen...',
      'show_to_waiter': '👆 Show this screen to your waiter'
    };
  }

  private getEnglishAllergenFallbacks(): { [key: string]: string } {
    return {
      'gluten': 'Gluten',
      'dairy': 'Dairy',
      'eggs': 'Eggs',
      'nuts': 'Nuts',
      'fish': 'Fish',
      'shellfish': 'Shellfish',
      'soy': 'Soy'
    };
  }

  private getEnglishDietaryTagFallbacks(): { [key: string]: string } {
    return {
      'vegetarian': 'Vegetarian',
      'vegan': 'Vegan',
      'gluten-free': 'Gluten Free',
      'dairy-free': 'Dairy Free',
      'low-carb': 'Low Carb'
    };
  }
}

// Create and export singleton instance
export const translationService = new TranslationService();

// =============================================
// FILE: services/restaurantService.ts
// =============================================

interface RestaurantData {
  restaurant: {
    id: number;
    business_name: string;
    slug: string;
    address?: string;
    city?: string;
    country?: string;
    cuisine_type?: string;
    phone?: string;
    website?: string;
    description_en?: string;
    description_es?: string;
    description_zh?: string;
    description_fr?: string;
  };
  menu: {
    id: number;
    restaurant_name: string;
    restaurant_address?: string;
    prices_include_tax: boolean;
    tips_included: boolean;
    service_charge_percentage?: number;
    special_notes?: string;
    menu_description?: string;
  };
  dishes: Array<{
    id: number;
    dish_name: string;
    section_name: string;
    price?: number;
    currency: string;
    description_en?: string;
    description_es?: string;
    description_zh?: string;
    description_fr?: string;
    allergens: string[];
    dietary_tags: string[];
    display_order: number;
  }>;
  sections: Array<{
    id: number;
    section_name: string;
    section_description?: string;
    display_order: number;
  }>;
}

class RestaurantService {
  private baseUrl: string;
  private cache: { [slug: string]: RestaurantData } = {};

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8888/.netlify/functions'
      : '/.netlify/functions';
  }

  // Get restaurant data by slug
  async getRestaurantData(slug: string): Promise<RestaurantData> {
    if (this.cache[slug]) {
      return this.cache[slug];
    }

    try {
      const response = await fetch(`${this.baseUrl}/getRestaurantData?slug=${encodeURIComponent(slug)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Restaurant '${slug}' not found`);
        }
        throw new Error(`Failed to fetch restaurant data: ${response.status}`);
      }

      const data: RestaurantData = await response.json();
      
      // Cache the result for 5 minutes
      this.cache[slug] = data;
      setTimeout(() => {
        delete this.cache[slug];
      }, 5 * 60 * 1000);

      return data;
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error);
      throw error;
    }
  }

  // Get dish description in specific language
  getDishDescription(dish: any, language: string): string {
    const descriptionKey = `description_${language}`;
    return dish[descriptionKey] || dish.description_en || '';
  }

  // Clear cache
  clearCache(): void {
    this.cache = {};
  }
}

// Create and export singleton instance
export const restaurantService = new RestaurantService();

// =============================================
// HOOK: useTranslation.ts
// =============================================

import { useState, useEffect } from 'react';
import { translationService } from './translationService';

interface UseTranslationResult {
  t: (key: string, category?: string) => string;
  getAllergenName: (allergenKey: string) => string;
  getDietaryTagName: (tagKey: string) => string;
  isLoading: boolean;
  error: string | null;
}

export function useTranslation(language: string): UseTranslationResult {
  const [translations, setTranslations] = useState<{ [key: string]: string }>({});
  const [allergenTranslations, setAllergenTranslations] = useState<{ [key: string]: string }>({});
  const [dietaryTagTranslations, setDietaryTagTranslations] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [uiTranslations, allergens, dietaryTags] = await Promise.all([
          translationService.getTranslations(language),
          translationService.getAllergenTranslations(language),
          translationService.getDietaryTagTranslations(language)
        ]);

        setTranslations(uiTranslations);
        setAllergenTranslations(allergens);
        setDietaryTagTranslations(dietaryTags);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load translations');
        console.error('Translation loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const t = (key: string, category?: string): string => {
    return translations[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAllergenName = (allergenKey: string): string => {
    return allergenTranslations[allergenKey] || allergenKey.charAt(0).toUpperCase() + allergenKey.slice(1);
  };

  const getDietaryTagName = (tagKey: string): string => {
    return dietaryTagTranslations[tagKey] || tagKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return {
    t,
    getAllergenName,
    getDietaryTagName,
    isLoading,
    error
  };
}