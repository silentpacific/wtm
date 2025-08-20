import type { Handler, HandlerEvent } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

export const handler: Handler = async (event: HandlerEvent) => {
    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { dishes, restaurantId, restaurantName, cuisineType } = JSON.parse(event.body || '{}');

        if (!dishes || !restaurantId) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        console.log(`💾 Saving ${dishes.length} dishes for restaurant ${restaurantId}`);

        // First, check if we need to create a menu for this restaurant
        let { data: existingMenu, error: menuCheckError } = await supabaseAdmin
            .from('restaurant_menus')
            .select('id')
            .eq('restaurant_id', parseInt(restaurantId))
            .single();

        let menuId;
        
        if (!existingMenu) {
            // Create new menu
            const { data: newMenu, error: menuCreateError } = await supabaseAdmin
                .from('restaurant_menus')
                .insert({
                    restaurant_id: parseInt(restaurantId),
                    restaurant_name: restaurantName,
                    restaurant_address: '',
                    prices_include_tax: false,
                    tips_included: false,
                    menu_description: `Menu scanned and uploaded automatically`,
                    is_active: true
                })
                .select('id')
                .single();

            if (menuCreateError) {
                console.error('Error creating menu:', menuCreateError);
                throw new Error('Failed to create menu');
            }
            
            menuId = newMenu.id;
            console.log(`✅ Created new menu with ID: ${menuId}`);
        } else {
            menuId = existingMenu.id;
            console.log(`✅ Using existing menu ID: ${menuId}`);
        }

        // Clear existing dishes for this restaurant (so we can replace with scanned ones)
        const { error: deleteError } = await supabaseAdmin
            .from('restaurant_dishes')
            .delete()
            .eq('restaurant_id', parseInt(restaurantId));

        if (deleteError) {
            console.error('Error deleting old dishes:', deleteError);
            // Continue anyway - we'll just add to existing
        }

        // Prepare dishes for database insertion
        const dishesToInsert = dishes.map((dish: any, index: number) => ({
            restaurant_id: parseInt(restaurantId),
            menu_id: menuId,
            dish_name: dish.name,
            dish_name_slug: dish.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            section_name: dish.section,
            price: dish.price || null,
            currency: 'USD',
            description_en: '', // Will be filled when user clicks on dishes
            description_es: '',
            description_zh: '',
            description_fr: '',
            allergens: [],
            dietary_tags: [],
            is_available: true,
            display_order: index
        }));

        // Insert dishes in batches (Supabase has limits)
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < dishesToInsert.length; i += batchSize) {
            const batch = dishesToInsert.slice(i, i + batchSize);
            
            const { error: insertError } = await supabaseAdmin
                .from('restaurant_dishes')
                .insert(batch);

            if (insertError) {
                console.error('Error inserting dish batch:', insertError);
                throw new Error(`Failed to insert dishes: ${insertError.message}`);
            }
            
            insertedCount += batch.length;
            console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}, total dishes: ${insertedCount}`);
        }

        // Update restaurant profile with cuisine type if provided
        if (cuisineType) {
            const { error: updateError } = await supabaseAdmin
                .from('restaurant_business_accounts')
                .update({ cuisine_type: cuisineType })
                .eq('id', parseInt(restaurantId));

            if (updateError) {
                console.error('Error updating cuisine type:', updateError);
                // Don't fail the whole operation for this
            } else {
                console.log(`✅ Updated restaurant cuisine type to: ${cuisineType}`);
            }
        }

        console.log(`🎉 Successfully saved ${insertedCount} dishes for restaurant ${restaurantId}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                dishesCreated: insertedCount,
                menuId: menuId,
                message: `Successfully saved ${insertedCount} dishes to your restaurant menu`
            })
        };

    } catch (error) {
        console.error('Error saving scanned dishes:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Failed to save dishes to database',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};