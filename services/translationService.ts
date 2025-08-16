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