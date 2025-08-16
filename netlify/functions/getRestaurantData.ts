// =============================================
// FILE: netlify/functions/getRestaurantData.ts
// =============================================

import type { Handler } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface RestaurantData {
  restaurant: any;
  menu: any;
  dishes: any[];
  sections: any[];
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
    const { slug } = event.queryStringParameters || {};

    if (!slug) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Restaurant slug is required' }),
      };
    }

    // Get restaurant data
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurant_business_accounts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (restaurantError || !restaurant) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Restaurant not found' }),
      };
    }

    // Get restaurant menu
    const { data: menu, error: menuError } = await supabase
      .from('restaurant_menus')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .single();

    if (menuError || !menu) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Restaurant menu not found' }),
      };
    }

    // Get restaurant dishes
    const { data: dishes, error: dishesError } = await supabase
      .from('restaurant_dishes')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_available', true)
      .order('section_name')
      .order('display_order');

    if (dishesError) {
      console.error('Error fetching dishes:', dishesError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch restaurant dishes' }),
      };
    }

    // Get menu sections
    const { data: sections, error: sectionsError } = await supabase
      .from('restaurant_menu_sections')
      .select('*')
      .eq('restaurant_id', restaurant.id)
      .eq('is_active', true)
      .order('display_order');

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
    }

    const responseData: RestaurantData = {
      restaurant,
      menu,
      dishes: dishes || [],
      sections: sections || []
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
    console.error('Restaurant data service error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};