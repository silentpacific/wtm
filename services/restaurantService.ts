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