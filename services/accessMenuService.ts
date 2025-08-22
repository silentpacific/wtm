import { supabase } from './supabaseClient';

export interface AccessMenuDish {
  id: number;
  section_name: Record<string, string>;
  dish_name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  allergens: string[];
  dietary_tags: string[];
  explanation?: Record<string, string>;
}

export interface AccessMenu {
  id: number;
  name: string;
  dishes: AccessMenuDish[];
}

export const getAccessMenu = async (menuId: number): Promise<AccessMenu | null> => {
  try {
    // Get menu info
    const { data: menu, error: menuError } = await supabase
      .from('accessmenu_menus')
      .select('id, name')
      .eq('id', menuId)
      .eq('is_active', true)
      .single();

    if (menuError || !menu) {
      console.error('Error fetching menu:', menuError);
      return null;
    }

    // Get dishes for this menu
    const { data: dishes, error: dishesError } = await supabase
      .from('accessmenu_dishes')
      .select('*')
      .eq('accessmenu_menu_id', menuId)
      .order('id');

    if (dishesError) {
      console.error('Error fetching dishes:', dishesError);
      return null;
    }

    return {
      ...menu,
      dishes: dishes || []
    };
  } catch (error) {
    console.error('Error in getAccessMenu:', error);
    return null;
  }
};