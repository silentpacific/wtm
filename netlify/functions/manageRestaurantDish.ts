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
    'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
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

    try {
        const { action, dish, restaurantId } = JSON.parse(event.body || '{}');

        if (!action || !restaurantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Action and restaurant ID are required' })
            };
        }

        console.log(`🍽️ ${action.toUpperCase()} dish for restaurant ${restaurantId}`);

        switch (action) {
            case 'add':
                if (!dish || !dish.name || !dish.section) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Dish name and section are required' })
                    };
                }

                // First, get or create menu for this restaurant
                let { data: menu, error: menuError } = await supabaseAdmin
                    .from('restaurant_menus')
                    .select('id')
                    .eq('restaurant_id', parseInt(restaurantId))
                    .single();

                let menuId;
                if (!menu) {
                    // Create menu if it doesn't exist
                    const { data: newMenu, error: createError } = await supabaseAdmin
                        .from('restaurant_menus')
                        .insert({
                            restaurant_id: parseInt(restaurantId),
                            restaurant_name: 'Restaurant Menu',
                            is_active: true
                        })
                        .select('id')
                        .single();

                    if (createError) {
                        throw new Error('Failed to create menu');
                    }
                    menuId = newMenu.id;
                } else {
                    menuId = menu.id;
                }

                // Add the dish
                const { data: newDish, error: addError } = await supabaseAdmin
                    .from('restaurant_dishes')
                    .insert({
                        restaurant_id: parseInt(restaurantId),
                        menu_id: menuId,
                        dish_name: dish.name,
                        dish_name_slug: dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        section_name: dish.section,
                        price: dish.price || null,
                        currency: 'USD',
                        description_en: dish.description || '',
                        allergens: dish.allergens || [],
                        dietary_tags: dish.dietary_tags || [],
                        is_available: true,
                        display_order: 0
                    })
                    .select('id')
                    .single();

                if (addError) {
                    console.error('Error adding dish:', addError);
                    throw new Error('Failed to add dish');
                }

                console.log(`✅ Added dish: ${dish.name}`);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        dishId: newDish.id,
                        message: 'Dish added successfully' 
                    })
                };

            case 'update':
                if (!dish || !dish.id) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Dish ID is required for update' })
                    };
                }

                const { error: updateError } = await supabaseAdmin
                    .from('restaurant_dishes')
                    .update({
                        dish_name: dish.name,
                        section_name: dish.section,
                        price: dish.price || null,
                        description_en: dish.description || '',
                        allergens: dish.allergens || [],
                        dietary_tags: dish.dietary_tags || []
                    })
                    .eq('id', parseInt(dish.id))
                    .eq('restaurant_id', parseInt(restaurantId));

                if (updateError) {
                    console.error('Error updating dish:', updateError);
                    throw new Error('Failed to update dish');
                }

                console.log(`✅ Updated dish: ${dish.name}`);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Dish updated successfully' 
                    })
                };

            case 'delete':
                if (!dish || !dish.id) {
                    return {
                        statusCode: 400,
                        headers: corsHeaders,
                        body: JSON.stringify({ error: 'Dish ID is required for deletion' })
                    };
                }

                const { error: deleteError } = await supabaseAdmin
                    .from('restaurant_dishes')
                    .update({ is_available: false })
                    .eq('id', parseInt(dish.id))
                    .eq('restaurant_id', parseInt(restaurantId));

                if (deleteError) {
                    console.error('Error deleting dish:', deleteError);
                    throw new Error('Failed to delete dish');
                }

                console.log(`✅ Deleted dish ID: ${dish.id}`);
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Dish deleted successfully' 
                    })
                };

            default:
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }

    } catch (error) {
        console.error('Error in manageRestaurantDish:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Failed to manage dish',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};