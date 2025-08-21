// =============================================
// FILE: netlify/functions/getRestaurantData.ts
// FIXED: Works for all restaurants, handles missing tables gracefully
// =============================================

import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface RestaurantData {
  restaurant: any;
  menu?: any;
  dishes: any[];
  sections: string[];
  dishCount: number;
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { slug, restaurantId, listAll } = event.queryStringParameters || {};

    // Handle different query types
    if (listAll === 'true') {
      // List all restaurants for debugging
      const { data: restaurants, error } = await supabase
        .from('restaurant_business_accounts')
        .select('id, business_name, slug, contact_email')
        .order('business_name');

      return {
        statusCode: 200,
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurants: restaurants || [] }),
      };
    }

    // Get restaurant by slug OR by restaurantId
    let restaurant;
    if (slug) {
      const { data, error } = await supabase
        .from('restaurant_business_accounts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Restaurant not found',
            details: `No restaurant found with slug: ${slug}`
          }),
        };
      }
      restaurant = data;
    } else if (restaurantId) {
      const { data, error } = await supabase
        .from('restaurant_business_accounts')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error || !data) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'Restaurant not found',
            details: `No restaurant found with ID: ${restaurantId}`
          }),
        };
      }
      restaurant = data;
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Restaurant slug or restaurantId is required' }),
      };
    }

    console.log(`🏪 Loading data for restaurant: ${restaurant.business_name} (ID: ${restaurant.id})`);

    // Get restaurant menu (optional - don't fail if missing)
    let menu = null;
    try {
      const { data: menuData, error: menuError } = await supabase
        .from('restaurant_menus')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .maybeSingle(); // Use maybeSingle to avoid error if no results

      if (!menuError && menuData) {
        menu = menuData;
        console.log(`📋 Found menu: ${menu.name || 'Default Menu'}`);
      } else {
        console.log(`📋 No active menu found for restaurant ${restaurant.id}`);
      }
    } catch (menuError) {
      console.log(`📋 Menu table query failed (non-critical): ${menuError}`);
    }

    // Get restaurant dishes (CRITICAL - must work)
    const { data: dishes, error: dishesError } = await supabase
      .from('restaurant_dishes')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .order('section_name')
      .order('display_order');

    if (dishesError) {
      console.error('❌ Error fetching dishes:', dishesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to fetch restaurant dishes',
          details: dishesError.message 
        }),
      };
    }

    const dishList = dishes || [];
    console.log(`🍽️ Found ${dishList.length} dishes`);

    // Generate dynamic sections from actual dish data
    const uniqueSections = [...new Set(
      dishList
        .map(dish => dish.section_name)
        .filter(section => section && section.trim() !== '')
    )];

    // Sort sections in a logical order
    const sectionOrder = [
      'Appetizers', 'Starters', 'Soups', 'Salads',
      'Mains', 'Main Course', 'Entrees', 'Pizza', 'Pasta',
      'Desserts', 'Sweets',
      'Drinks', 'Beverages', 'Coffee', 'Tea', 'Wine', 'Beer'
    ];

    const sortedSections = uniqueSections.sort((a, b) => {
      const aIndex = sectionOrder.findIndex(s => s.toLowerCase() === a.toLowerCase());
      const bIndex = sectionOrder.findIndex(s => s.toLowerCase() === b.toLowerCase());
      
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    console.log(`📂 Dynamic sections: ${sortedSections.join(', ')}`);

    // Prepare response data
    const responseData: RestaurantData = {
      restaurant,
      menu,
      dishes: dishList,
      sections: sortedSections,
      dishCount: dishList.length
    };

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error('❌ Restaurant data service error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};