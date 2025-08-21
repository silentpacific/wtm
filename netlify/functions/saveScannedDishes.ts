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
            description_en: '', // Will be filled by AI
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

        // ⚡ START BACKGROUND AI PROCESSING - Fire and forget!
        console.log('🧠 Starting background AI explanation generation...');
        
        // Create a processing queue in the database
        const processingQueue = [];
        const languages = ['en', 'es', 'zh', 'fr'];
        
        dishes.forEach((dish: any) => {
            languages.forEach(language => {
                processingQueue.push({
                    dishName: dish.name,
                    language,
                    restaurantId,
                    restaurantName: restaurantName || 'Restaurant'
                });
            });
        });

        console.log(`📝 Created processing queue with ${processingQueue.length} items (${dishes.length} dishes × 4 languages)`);

        // Save processing status to database for tracking
        try {
            await supabaseAdmin
                .from('restaurant_business_accounts')
                .update({ 
                    special_notes: `AI processing: 0/${processingQueue.length} explanations complete` 
                })
                .eq('id', parseInt(restaurantId));
        } catch (error) {
            console.error('Error updating processing status:', error);
        }

        // Trigger the first explanation immediately (async)
        if (processingQueue.length > 0) {
            triggerNextExplanation(processingQueue[0], processingQueue, 0).catch(console.error);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                dishesCreated: insertedCount,
                menuId: menuId,
                message: `Successfully saved ${insertedCount} dishes to your restaurant menu`,
                aiProcessingStarted: true,
                totalExplanationsToGenerate: processingQueue.length
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

// Background processing function with 10-second delays
async function triggerNextExplanation(
    item: { dishName: string; language: string; restaurantId: string; restaurantName: string },
    queue: any[],
    index: number
) {
    try {
        console.log(`🔄 Processing ${index + 1}/${queue.length}: ${item.dishName} (${item.language})`);
        
        // Call the single explanation function
        const response = await fetch(`${process.env.URL || 'https://whatthemenu.netlify.app'}/.netlify/functions/generateDishExplanations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                restaurantId: item.restaurantId,
                dishName: item.dishName,
                language: item.language,
                restaurantName: item.restaurantName
            })
        });

        if (response.ok) {
            console.log(`✅ Generated ${item.language} explanation for: ${item.dishName}`);
        } else {
            console.error(`❌ Failed to generate ${item.language} explanation for: ${item.dishName}`);
        }

        // Update progress in database
        try {
            await supabaseAdmin
                .from('restaurant_business_accounts')
                .update({ 
                    special_notes: `AI processing: ${index + 1}/${queue.length} explanations complete` 
                })
                .eq('id', parseInt(item.restaurantId));
        } catch (error) {
            console.error('Error updating progress:', error);
        }

        // Schedule next item with 10-second delay
        const nextIndex = index + 1;
        if (nextIndex < queue.length) {
            setTimeout(() => {
                triggerNextExplanation(queue[nextIndex], queue, nextIndex).catch(console.error);
            }, 10000); // 10-second delay
        } else {
            // All done!
            console.log(`🎉 Completed all ${queue.length} explanations for restaurant ${item.restaurantId}`);
            
            // Clear processing status
            try {
                await supabaseAdmin
                    .from('restaurant_business_accounts')
                    .update({ 
                        special_notes: `AI processing complete: ${queue.length} explanations generated` 
                    })
                    .eq('id', parseInt(item.restaurantId));
            } catch (error) {
                console.error('Error updating completion status:', error);
            }
        }

    } catch (error) {
        console.error(`Error processing ${item.dishName} (${item.language}):`, error);
        
        // Continue with next item even if this one failed
        const nextIndex = index + 1;
        if (nextIndex < queue.length) {
            setTimeout(() => {
                triggerNextExplanation(queue[nextIndex], queue, nextIndex).catch(console.error);
            }, 10000);
        }
    }
}