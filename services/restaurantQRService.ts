import { supabase } from './supabaseClient';

export interface RestaurantQRData {
  id: number;
  name: string;
  slug: string;
  city: string;
  cuisine_type: string;
  phone?: string;
  address?: string;
  hours?: string;
  accessmenu_menu_id?: number;
  has_accessmenu: boolean;
}

export interface QRAccessMenuDish {
  id: number;
  section_name: Record<string, string>;
  dish_name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  allergens: string[];
  dietary_tags: string[];
  explanation?: Record<string, string>;
}

export interface QRAccessMenu {
  id: number;
  name: string;
  restaurant: RestaurantQRData;
  dishes: QRAccessMenuDish[];
  sections: Array<{
    name: string;
    items: QRAccessMenuDish[];
  }>;
}

// Generate slug from restaurant name and city
export const generateRestaurantSlug = (name: string, city: string): string => {
  const combined = `${name}-${city}`;
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Get restaurant data by slug for QR code access
export const getRestaurantBySlug = async (slug: string): Promise<QRAccessMenu | null> => {
  try {
    // First, find the restaurant by slug
    // For now, we'll match by generated slug logic until you add slug column
    const { data: restaurants, error: restaurantError } = await supabase
      .from('restaurants')
      .select('*');

    if (restaurantError) {
      console.error('Error fetching restaurants:', restaurantError);
      return null;
    }

    // Find restaurant that matches the slug
    const restaurant = restaurants?.find(r => {
      const generatedSlug = generateRestaurantSlug(r.name || '', r.city || '');
      return generatedSlug === slug;
    });

    if (!restaurant) {
      console.error('Restaurant not found for slug:', slug);
      return null;
    }

    // Get the AccessMenu for this restaurant
    const { data: accessMenus, error: menuError } = await supabase
      .from('accessmenu_menus')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .limit(1);

    if (menuError) {
      console.error('Error fetching access menu:', menuError);
      return null;
    }

    const accessMenu = accessMenus?.[0];
    
    if (!accessMenu) {
      console.error('No AccessMenu found for restaurant:', restaurant.name);
      return null;
    }

    // Get dishes for this menu
    const { data: dishes, error: dishesError } = await supabase
      .from('accessmenu_dishes')
      .select('*')
      .eq('accessmenu_menu_id', accessMenu.id)
      .order('id');

    if (dishesError) {
      console.error('Error fetching dishes:', dishesError);
      return null;
    }

    // Group dishes by section
    const sections = groupDishesBySection(dishes || []);

    return {
      id: accessMenu.id,
      name: accessMenu.name,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: slug,
        city: restaurant.city || '',
        cuisine_type: restaurant.cuisine_type || '',
        has_accessmenu: true,
        accessmenu_menu_id: accessMenu.id
      },
      dishes: dishes || [],
      sections
    };
  } catch (error) {
    console.error('Error in getRestaurantBySlug:', error);
    return null;
  }
};

// Helper function to group dishes by section
const groupDishesBySection = (dishes: QRAccessMenuDish[]): Array<{ name: string; items: QRAccessMenuDish[] }> => {
  const sectionMap = new Map<string, QRAccessMenuDish[]>();

  dishes.forEach(dish => {
    // Use English section name as the key (fallback to first available language)
    const sectionName = dish.section_name?.en || 
                       dish.section_name?.es || 
                       dish.section_name?.zh || 
                       dish.section_name?.fr || 
                       Object.values(dish.section_name)[0] || 
                       'Other';

    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, []);
    }
    sectionMap.get(sectionName)!.push(dish);
  });

  // Convert map to array and sort sections
  return Array.from(sectionMap.entries())
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Create or update restaurant QR data (for restaurant admin use)
export const createRestaurantQR = async (
  restaurantId: number,
  menuData: {
    name: string;
    sections: Array<{
      name: string;
      items: Array<{
        name: string;
        description: string;
        price: number;
        allergens?: string[];
        dietary_tags?: string[];
      }>;
    }>;
  }
): Promise<{ success: boolean; menu_id?: number; error?: string }> => {
  try {
    // Create AccessMenu record
    const { data: menu, error: menuError } = await supabase
      .from('accessmenu_menus')
      .insert({
        restaurant_id: restaurantId,
        name: menuData.name,
        is_active: true
      })
      .select()
      .single();

    if (menuError || !menu) {
      console.error('Error creating access menu:', menuError);
      return { success: false, error: 'Failed to create menu' };
    }

    // Create dishes for each section
    const dishes = [];
    for (const section of menuData.sections) {
      for (const item of section.items) {
        dishes.push({
          accessmenu_menu_id: menu.id,
          section_name: {
            en: section.name,
            zh: section.name, // Would need translation service
            es: section.name,
            fr: section.name
          },
          dish_name: {
            en: item.name,
            zh: item.name, // Would need translation service
            es: item.name,
            fr: item.name
          },
          description: {
            en: item.description,
            zh: item.description, // Would need translation service
            es: item.description,
            fr: item.description
          },
          price: item.price,
          allergens: item.allergens || [],
          dietary_tags: item.dietary_tags || []
        });
      }
    }

    if (dishes.length > 0) {
      const { error: dishesError } = await supabase
        .from('accessmenu_dishes')
        .insert(dishes);

      if (dishesError) {
        console.error('Error creating dishes:', dishesError);
        return { success: false, error: 'Failed to create dishes' };
      }
    }

    return { success: true, menu_id: menu.id };
  } catch (error) {
    console.error('Error in createRestaurantQR:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// Check if restaurant has AccessMenu enabled
export const checkRestaurantAccessMenu = async (restaurantId: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('accessmenu_menus')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('Error checking AccessMenu:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error in checkRestaurantAccessMenu:', error);
    return false;
  }
};