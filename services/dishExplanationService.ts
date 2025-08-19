// Service to get dish explanations in multiple languages
// Reuses the existing getDishExplanation function

export interface DishExplanation {
  dish_name: string;
  explanation: string;
  allergens: string[];
  dietary_info: string[];
  language: string;
}

class DishExplanationService {
  
  // Get dish explanation in specified language
  async getDishExplanation(
    dishName: string, 
    restaurantName: string, 
    language: 'en' | 'es' | 'zh' | 'fr' = 'en'
  ): Promise<DishExplanation | null> {
    try {
      console.log(`🌐 Getting explanation for "${dishName}" in ${language}`);
      
      const response = await fetch('/.netlify/functions/getDishExplanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dishName,
          restaurantName,
          language,
          // This tells the function to prioritize restaurant-specific context
          restaurantContext: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.status}`);
      }

      const result = await response.json();
      
      // The existing function returns the explanation in the requested language
      return {
        dish_name: dishName,
        explanation: result.explanation || '',
        allergens: result.allergens || [],
        dietary_info: result.dietary_info || [],
        language: language
      };

    } catch (error) {
      console.error('Error getting dish explanation:', error);
      return null;
    }
  }

  // Get explanations in all supported languages
  async getAllLanguageExplanations(
    dishName: string, 
    restaurantName: string
  ): Promise<Record<string, DishExplanation | null>> {
    const languages: Array<'en' | 'es' | 'zh' | 'fr'> = ['en', 'es', 'zh', 'fr'];
    
    const promises = languages.map(async (lang) => {
      const explanation = await this.getDishExplanation(dishName, restaurantName, lang);
      return { [lang]: explanation };
    });

    const results = await Promise.all(promises);
    
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  }

  // Batch get explanations for multiple dishes
  async getBatchExplanations(
    dishes: Array<{ name: string; section: string }>, 
    restaurantName: string, 
    language: 'en' | 'es' | 'zh' | 'fr' = 'en'
  ): Promise<Record<string, DishExplanation | null>> {
    const promises = dishes.map(async (dish) => {
      const explanation = await this.getDishExplanation(dish.name, restaurantName, language);
      return { [dish.name]: explanation };
    });

    const results = await Promise.all(promises);
    return results.reduce((acc, result) => ({ ...acc, ...result }), {});
  }

  // Get explanation with caching for restaurant public pages
  async getCachedExplanation(
    dishName: string, 
    restaurantSlug: string, 
    restaurantName: string,
    language: 'en' | 'es' | 'zh' | 'fr' = 'en'
  ): Promise<DishExplanation | null> {
    try {
      // This uses the existing caching mechanism in getDishExplanation
      const cacheKey = `${dishName}_${restaurantSlug}_${language}`;
      
      // Check if we have it cached locally first
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          // Invalid cache, continue to fetch
        }
      }

      const explanation = await this.getDishExplanation(dishName, restaurantName, language);
      
      // Cache the result
      if (explanation) {
        sessionStorage.setItem(cacheKey, JSON.stringify(explanation));
      }
      
      return explanation;
    } catch (error) {
      console.error('Error getting cached explanation:', error);
      return null;
    }
  }
}

export const dishExplanationService = new DishExplanationService();