// netlify/functions/dietary-analyzer.ts - Complete updated version
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Schema for batch dietary analysis
const dietaryBatchSchema = {
  type: Type.OBJECT,
  properties: {
    analyses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dish_id: { type: Type.STRING, description: "The dish ID to update" },
          allergens: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Allergens present: Gluten, Dairy, Eggs, Nuts, Peanuts, Soy, Fish, Shellfish, Sesame"
          },
          dietary_tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Dietary classifications: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb, High-Protein, Spicy, Healthy"
          }
        },
        required: ["dish_id", "allergens", "dietary_tags"]
      }
    }
  },
  required: ["analyses"]
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Process dishes in batches for efficiency
async function processDishBatch(dishes: any[], ai: any): Promise<any[]> {
  const dishList = dishes.map(dish => 
    `ID: ${dish.id}\nName: "${dish.name}"\nDescription: "${dish.description || 'No description provided'}"`
  ).join('\n\n---\n\n');

  const prompt = `You are a restaurant nutrition expert. Analyze these dishes for allergens and dietary information.

DISHES TO ANALYZE:
${dishList}

For each dish, determine based on typical restaurant preparation:

1. ALLERGENS - What allergens this dish LIKELY contains:
   - Standard allergens: Gluten, Dairy, Eggs, Nuts, Peanuts, Soy, Fish, Shellfish, Sesame
   - Consider typical ingredients and cross-contamination in restaurant kitchens
   - BE CONSERVATIVE: If there's any reasonable chance an allergen is present, include it
   - Examples: 
     * Most pasta dishes contain Gluten
     * Creamy sauces usually contain Dairy
     * Fried items often contain Gluten (breading) and may have cross-contamination
     * Asian dishes often contain Soy

2. DIETARY TAGS - What classifications clearly apply:
   - Available tags: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb, High-Protein, Spicy, Healthy
   - Only include if you're confident the dish typically meets that criteria
   - Be conservative with Gluten-Free and Dairy-Free due to cross-contamination
   - Examples:
     * Obviously meat/fish dishes are not Vegetarian
     * Salads without meat/dairy may be Vegan
     * Grilled proteins are often High-Protein

IMPORTANT: Return results for EVERY dish using the exact dish ID provided. If unsure about a dish, err on the side of including allergens and being conservative with dietary tags.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-8b',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: dietaryBatchSchema,
      temperature: 0.1,
      maxOutputTokens: 4096
    },
  });

  const result = JSON.parse(response.text.trim());
  return result.analyses || [];
}

// Update dishes in database
async function updateDishesInDatabase(analyzedDishes: any[]): Promise<number> {
  if (analyzedDishes.length === 0) return 0;

  let successCount = 0;

  // Update dishes individually to handle any ID mismatches gracefully
  for (const dish of analyzedDishes) {
    try {
      const { error } = await supabaseAdmin
        .from('menu_items')
        .update({
          allergens: dish.allergens || [],
          dietary_tags: dish.dietary_tags || [],
          needs_dietary_analysis: false,
          dietary_analyzed_at: new Date().toISOString()
        })
        .eq('id', dish.dish_id);

      if (error) {
        console.error(`Failed to update dish ${dish.dish_id}:`, error);
      } else {
        successCount++;
      }
    } catch (error) {
      console.error(`Error updating dish ${dish.dish_id}:`, error);
    }
  }

  return successCount;
}

// Mark menu as complete
async function markMenuComplete(menuId: string, successCount: number, totalCount: number): Promise<void> {
  const status = successCount === totalCount ? 'active' : 'error';
  const errorMessage = successCount < totalCount 
    ? `Dietary analysis partially failed: ${successCount}/${totalCount} dishes analyzed`
    : null;

  const { error } = await supabaseAdmin
    .from('menus')
    .update({ 
      status,
      error_message: errorMessage,
      dietary_analysis_completed_at: new Date().toISOString()
    })
    .eq('id', menuId);

  if (error) {
    console.error('Failed to update menu status:', error);
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const startTime = Date.now();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  const { menuId } = requestBody;

  if (!menuId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'menuId is required' })
    };
  }

  if (!geminiApiKey) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    console.log(`Starting dietary analysis for menu: ${menuId}`);

    // Get all dishes that need analysis
    const { data: dishes, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, description, menu_id')
      .eq('menu_id', menuId)
      .eq('needs_dietary_analysis', true)
      .order('created_at');

    if (fetchError) {
      console.error('Failed to fetch dishes:', fetchError);
      throw fetchError;
    }

    if (!dishes || dishes.length === 0) {
      console.log('No dishes need dietary analysis');
      await markMenuComplete(menuId, 0, 0);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'No dishes needed analysis',
          processed: 0,
          menuId
        })
      };
    }

    console.log(`Found ${dishes.length} dishes needing analysis`);

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let totalProcessed = 0;
    const totalDishes = dishes.length;

    // Process in batches of 4 dishes (good balance for API limits and efficiency)
    const BATCH_SIZE = 4;
    const batches = [];
    for (let i = 0; i < dishes.length; i += BATCH_SIZE) {
      batches.push(dishes.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} dishes each`);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchNum = i + 1;
      
      console.log(`Processing batch ${batchNum}/${batches.length}: ${batch.length} dishes`);

      try {
        const analyzedDishes = await processDishBatch(batch, ai);
        console.log(`AI returned analysis for ${analyzedDishes.length} dishes`);
        
        if (analyzedDishes.length > 0) {
          const updatedCount = await updateDishesInDatabase(analyzedDishes);
          totalProcessed += updatedCount;
          console.log(`Successfully updated ${updatedCount}/${analyzedDishes.length} dishes in batch ${batchNum}`);
        }

        // Small delay between batches to avoid rate limits
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (batchError) {
        console.error(`Error processing batch ${batchNum}:`, batchError);
        // Continue with next batch rather than failing entirely
      }
    }

    // Mark menu as complete
    await markMenuComplete(menuId, totalProcessed, totalDishes);

    const processingTime = Date.now() - startTime;
    const successRate = totalDishes > 0 ? Math.round((totalProcessed / totalDishes) * 100) : 0;

    console.log(`Dietary analysis completed in ${processingTime}ms: ${totalProcessed}/${totalDishes} dishes (${successRate}%)`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
      },
      body: JSON.stringify({
        success: true,
        menuId,
        processed: totalProcessed,
        total: totalDishes,
        successRate,
        processingTime,
        message: totalProcessed === totalDishes 
          ? `Dietary analysis completed successfully for all ${totalProcessed} dishes`
          : `Dietary analysis completed for ${totalProcessed}/${totalDishes} dishes (${successRate}% success rate)`
      })
    };

  } catch (error) {
    console.error('Dietary analysis error:', error);
    
    // Mark menu with error status
    try {
      await supabaseAdmin
        .from('menus')
        .update({ 
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error in dietary analysis',
          dietary_analysis_completed_at: new Date().toISOString()
        })
        .eq('id', menuId);
    } catch (dbError) {
      console.error('Failed to update menu error status:', dbError);
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: `Dietary analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        menuId,
        processingTime: Date.now() - startTime
      })
    };
  }
};