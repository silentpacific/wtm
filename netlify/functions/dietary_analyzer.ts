// netlify/functions/dietary-analyzer.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Schema for batch dietary analysis
const dietaryBatchSchema = {
  type: Type.OBJECT,
  properties: {
    dishes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dish_id: { type: Type.STRING },
          allergens: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Common allergens: Gluten, Dairy, Eggs, Nuts, Peanuts, Soy, Fish, Shellfish, Sesame"
          },
          dietary_tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Dietary tags: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, High-Protein, Spicy, Healthy"
          }
        },
        required: ["dish_id", "allergens", "dietary_tags"]
      }
    }
  },
  required: ["dishes"]
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
    `ID: ${dish.id}\nDish: "${dish.name}"\nDescription: "${dish.description || 'No description'}"`
  ).join('\n\n');

  const prompt = `Analyze these restaurant dishes for allergens and dietary information. Be conservative - only include allergens/tags you're confident about based on typical restaurant preparations.

DISHES TO ANALYZE:
${dishList}

For each dish, determine:
1. ALLERGENS: What allergens this dish likely contains based on typical ingredients and preparation methods
   - Common allergens: Gluten, Dairy, Eggs, Nuts, Peanuts, Soy, Fish, Shellfish, Sesame
   - Consider cross-contamination in restaurant kitchens
   - If unsure, include the allergen to be safe

2. DIETARY TAGS: What dietary classifications apply
   - Available tags: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb, High-Protein, Spicy, Healthy
   - Only include if you're confident the dish typically meets that criteria
   - Consider restaurant preparation methods

Return JSON with results for each dish using the provided dish ID.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: dietaryBatchSchema,
      temperature: 0.2 // Low temperature for consistent analysis
    },
  });

  const result = JSON.parse(response.text.trim());
  return result.dishes || [];
}

// Update dishes in database
async function updateDishesInDatabase(analyzedDishes: any[]) {
  const updates = analyzedDishes.map(dish => ({
    id: dish.dish_id,
    allergens: dish.allergens,
    dietary_tags: dish.dietary_tags,
    needs_dietary_analysis: false,
    dietary_analyzed_at: new Date().toISOString()
  }));

  const { error } = await supabaseAdmin
    .from('menu_items')
    .upsert(updates, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    });

  if (error) throw error;
  return updates.length;
}

// Mark menu as complete
async function markMenuComplete(menuId: string) {
  const { error } = await supabaseAdmin
    .from('menus')
    .update({ 
      status: 'active',
      dietary_analysis_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', menuId);

  if (error) throw error;
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON' })
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
      .select('id, name, description')
      .eq('menu_id', menuId)
      .eq('needs_dietary_analysis', true);

    if (fetchError) throw fetchError;

    if (!dishes || dishes.length === 0) {
      console.log('No dishes need dietary analysis');
      await markMenuComplete(menuId);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          message: 'No dishes needed analysis',
          processed: 0
        })
      };
    }

    console.log(`Analyzing ${dishes.length} dishes`);

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let totalProcessed = 0;

    // Process in batches of 15 dishes (good balance of efficiency and API limits)
    const BATCH_SIZE = 15;
    for (let i = 0; i < dishes.length; i += BATCH_SIZE) {
      const batch = dishes.slice(i, i + BATCH_SIZE);
      
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(dishes.length/BATCH_SIZE)}: ${batch.length} dishes`);

      const analyzedDishes = await processDishBatch(batch, ai);
      
      if (analyzedDishes.length > 0) {
        await updateDishesInDatabase(analyzedDishes);
        totalProcessed += analyzedDishes.length;
        console.log(`Updated ${analyzedDishes.length} dishes in database`);
      }

      // Small delay between batches to avoid rate limits
      if (i + BATCH_SIZE < dishes.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Mark menu as complete
    await markMenuComplete(menuId);

    const processingTime = Date.now() - startTime;
    console.log(`Dietary analysis completed in ${processingTime}ms`);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        menuId,
        processed: totalProcessed,
        processingTime,
        message: `Dietary analysis completed for ${totalProcessed} dishes`
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
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
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