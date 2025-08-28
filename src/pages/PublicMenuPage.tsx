// src/pages/PublicMenuPage.tsx - Public menu display using restaurant slug
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import RestaurantMenuPage from '../components/RestaurantMenuPage';
import { Loader, AlertCircle } from 'lucide-react';

interface MenuItem {
  id: string;
  section: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: number;
  allergens: string[];
  dietaryTags: string[];
  explanation: Record<string, string>;
}

interface MenuData {
  restaurantName: Record<string, string>;
  menuItems: MenuItem[];
  sections: Record<string, string[]>;
}

const PublicMenuPage: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantSlug) {
      loadMenuData();
    }
  }, [restaurantSlug]);

  const loadMenuData = async () => {
    if (!restaurantSlug) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1: Find all restaurants and create slugs to match
      const { data: allRestaurants, error: restaurantError } = await supabase
        .from('user_restaurant_profiles')
        .select('id, restaurant_name')
        .not('restaurant_name', 'is', null);

      if (restaurantError) throw restaurantError;

      if (!allRestaurants || allRestaurants.length === 0) {
        throw new Error('No restaurants found');
      }

      // Step 2: Find matching restaurant by creating slug from each name
      let matchingRestaurant = null;
      
      for (const restaurant of allRestaurants) {
        if (restaurant.restaurant_name) {
          const generatedSlug = restaurant.restaurant_name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          if (generatedSlug === restaurantSlug) {
            matchingRestaurant = restaurant;
            break;
          }
        }
      }

      if (!matchingRestaurant) {
        throw new Error(`Restaurant with URL "${restaurantSlug}" not found`);
      }

      // Step 3: Get the active menu for this restaurant
      const { data: menus, error: menuError } = await supabase
        .from('menus')
        .select(`
          id,
          name,
          status,
          menu_sections (
            id,
            name,
            display_order,
            menu_items (
              id,
              name,
              description,
              price,
              allergens,
              dietary_tags,
              display_order
            )
          )
        `)
        .eq('restaurant_id', matchingRestaurant.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (menuError) throw menuError;

      if (!menus || menus.length === 0) {
        throw new Error(`No published menu found for ${matchingRestaurant.restaurant_name}. The restaurant may still be setting up their menu.`);
      }

      const menu = menus[0];

      // Step 4: Transform the data to match RestaurantMenuPage format
      const sections = (menu.menu_sections || [])
        .sort((a: any, b: any) => a.display_order - b.display_order)
        .map((section: any) => ({
          name: section.name,
          items: (section.menu_items || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((item: any) => ({
              id: item.id,
              section: section.name,
              name: {
                en: item.name,
                zh: item.name,
                es: item.name,
                fr: item.name
              },
              description: {
                en: item.description || '',
                zh: item.description || '',
                es: item.description || '',
                fr: item.description || ''
              },
              price: parseFloat(item.price) || 0,
              allergens: item.allergens || [],
              dietaryTags: item.dietary_tags || [],
              explanation: {
                en: item.description || '',
                zh: item.description || '',
                es: item.description || '',
                fr: item.description || ''
              }
            }))
        }));

      // Step 5: Flatten items for RestaurantMenuPage format
      const menuItems = sections.flatMap(section => section.items);

      const formattedMenuData: MenuData = {
        restaurantName: {
          en: matchingRestaurant.restaurant_name,
          zh: matchingRestaurant.restaurant_name,
          es: matchingRestaurant.restaurant_name,
          fr: matchingRestaurant.restaurant_name
        },
        menuItems,
        sections: {
          en: sections.map(s => s.name),
          zh: sections.map(s => s.name),
          es: sections.map(s => s.name),
          fr: sections.map(s => s.name)
        }
      };

      setMenuData(formattedMenuData);

    } catch (err) {
      console.error('Error loading menu:', err);
      setError(err instanceof Error ? err.message : 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-wtm-bg flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-wtm-primary" />
          <p className="text-wtm-muted">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-wtm-bg flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-wtm-text mb-4">Menu Not Found</h1>
          <p className="text-wtm-muted mb-6">{error}</p>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="font-semibold text-wtm-text mb-2">Restaurant Owner?</h2>
            <p className="text-sm text-wtm-muted mb-4">
              If this is your restaurant, make sure your menu is published and active.
            </p>
            <a 
              href="/dashboard/menu-editor" 
              className="btn btn-primary inline-flex items-center"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="min-h-screen bg-wtm-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-wtm-muted">No menu data available</p>
        </div>
      </div>
    );
  }

  return (
    <RestaurantMenuPage 
      menuData={menuData} 
      menuId={restaurantSlug || 'unknown'} 
      isDemo={false}
    />
  );
};

export default PublicMenuPage;