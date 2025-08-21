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
                if (!dish || !dish.dish_name || !dish.section_name) {
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
                        dish_name: dish.dish_name,
                        dish_name_slug: dish.dish_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        section_name: dish.section_name,
                        price: dish.price || null,
                        currency: 'USD',
                        description_en: dish.description_en || '',
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

                console.log(`✅ Added dish: ${dish.dish_name}`);

                // 🧠 START AI EXPLANATION GENERATION for new dish
                triggerExplanationsForDish(restaurantId, dish.dish_name);

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        dishId: newDish.id,
                        message: 'Dish added successfully',
                        aiProcessingStarted: true
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
                        dish_name: dish.dish_name,
                        section_name: dish.section_name,
                        price: dish.price || null,
                        description_en: dish.description_en || '',
                        allergens: dish.allergens || [],
                        dietary_tags: dish.dietary_tags || []
                    })
                    .eq('id', parseInt(dish.id))
                    .eq('restaurant_id', parseInt(restaurantId));

                if (updateError) {
                    console.error('Error updating dish:', updateError);
                    throw new Error('Failed to update dish');
                }

                console.log(`✅ Updated dish: ${dish.dish_name}`);

                // 🧠 REGENERATE AI EXPLANATIONS for updated dish
                // First clear old explanations
                try {
                    await supabaseAdmin
                        .from('dishes')
                        .delete()
                        .eq('name', dish.dish_name)
                        .eq('restaurant_id', parseInt(restaurantId));
                    
                    console.log(`🗑️ Cleared old explanations for: ${dish.dish_name}`);
                } catch (error) {
                    console.error('Error clearing old explanations:', error);
                }

                // Generate new explanations
                triggerExplanationsForDish(restaurantId, dish.dish_name);

                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Dish updated successfully',
                        aiProcessingStarted: true
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

                // Get dish name before deleting for cleanup
                const { data: dishToDelete } = await supabaseAdmin
                    .from('restaurant_dishes')
                    .select('dish_name')
                    .eq('id', parseInt(dish.id))
                    .eq('restaurant_id', parseInt(restaurantId))
                    .single();

                const { error: deleteError } = await supabaseAdmin
                    .from('restaurant_dishes')
                    .update({ is_available: false })
                    .eq('id', parseInt(dish.id))
                    .eq('restaurant_id', parseInt(restaurantId));

                if (deleteError) {
                    console.error('Error deleting dish:', deleteError);
                    throw new Error('Failed to delete dish');
                }

                // Clean up AI explanations for deleted dish
                if (dishToDelete?.dish_name) {
                    try {
                        await supabaseAdmin
                            .from('dishes')
                            .delete()
                            .eq('name', dishToDelete.dish_name)
                            .eq('restaurant_id', parseInt(restaurantId));
                        
                        console.log(`🗑️ Cleaned up explanations for deleted dish: ${dishToDelete.dish_name}`);
                    } catch (error) {
                        console.error('Error cleaning up explanations:', error);
                    }
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

// Helper function to trigger AI explanations for a single dish (all 4 languages)
async function triggerExplanationsForDish(restaurantId: string, dishName: string) {
    const languages = ['en', 'es', 'zh', 'fr'];
    
    console.log(`🧠 Starting AI explanations for: ${dishName} (4 languages)`);
    
    // Get restaurant name for context
    let restaurantName = 'Restaurant';
    try {
        const { data: restaurant } = await supabaseAdmin
            .from('restaurant_business_accounts')
            .select('business_name')
            .eq('id', parseInt(restaurantId))
            .single();
        
        if (restaurant?.business_name) {
            restaurantName = restaurant.business_name;
        }
    } catch (error) {
        console.error('Error getting restaurant name:', error);
    }

    // Trigger explanations with staggered timing
    languages.forEach((language, index) => {
        setTimeout(async () => {
            try {
                const response = await fetch(`${process.env.URL || 'https://whatthemenu.netlify.app'}/.netlify/functions/generateDishExplanations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        restaurantId,
                        dishName,
                        language,
                        restaurantName
                    })
                });

                if (response.ok) {
                    console.log(`✅ Generated ${language} explanation for: ${dishName}`);
                } else {
                    console.error(`❌ Failed ${language} explanation for: ${dishName}`);
                }
            } catch (error) {
                console.error(`❌ Error generating ${language} explanation for ${dishName}:`, error);
            }
        }, index * 10000); // 10-second intervals (0s, 10s, 20s, 30s)
    });
}