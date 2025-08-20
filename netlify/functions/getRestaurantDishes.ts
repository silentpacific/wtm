import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const restaurantId = event.queryStringParameters?.restaurantId;

        if (!restaurantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Restaurant ID is required' })
            };
        }

        console.log(`📋 Loading dishes for restaurant ${restaurantId}`);

        // Get all dishes for this restaurant
        const { data: dishes, error } = await supabaseAdmin
            .from('restaurant_dishes')
            .select(`
                id,
                dish_name,
                section_name,
                price,
                currency,
                description_en,
                allergens,
                dietary_tags,
                is_available,
                display_order
            `)
            .eq('restaurant_id', parseInt(restaurantId))
            .eq('is_available', true)
            .order('section_name')
            .order('display_order');

        if (error) {
            console.error('Error loading dishes:', error);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Failed to load dishes' })
            };
        }

        console.log(`✅ Loaded ${dishes?.length || 0} dishes for restaurant ${restaurantId}`);

        // Transform to match frontend format
        const formattedDishes = (dishes || []).map(dish => ({
            id: dish.id.toString(),
            name: dish.dish_name,
            description: dish.description_en || '',
            price: dish.price || 0,
            section: dish.section_name,
            allergens: dish.allergens || [],
            dietary_tags: dish.dietary_tags || []
        }));

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                dishes: formattedDishes,
                count: formattedDishes.length
            })
        };

    } catch (error) {
        console.error('Error in getRestaurantDishes:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};