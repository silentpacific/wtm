// netlify/functions/dietary-analyzer.ts - Updated for translations-once
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

const dietaryBatchSchema = {
  type: "object",
  properties: {
    analyses: {
      type: "array",
      items: {
        type: "object",
        properties: {
          dish_id: { type: "string" },
          allergens: { type: "array", items: { type: "string" } },
          dietary_tags: { type: "array", items: { type: "string" } },
          translations: {
            type: "object",
            properties: {
              fr: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } },
              es: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } },
              zh: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } }
            }
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

// --- Batch Processing ---
async function processDishBatch(dishes: any[], ai: any): Promise<any[]> {
  const dishList = dishes.map(dish => 
    `ID: ${dish.id}\nName: "${dish.name}"\nDescription: "${dish.description || 'No description provided'}"`
  ).join('\n\n---\n\n');

  const prompt = `You are a restaurant nutrition and translation expert. For each dish, do two things:

1. Identify allergens and dietary tags:
   - Allergens: Gluten, Dairy, Eggs, Nuts, Peanuts, Soy, Fish, Shellfish, Sesame
   - Tags: Vegetarian, Vegan, Gluten-Free, Dairy-Free, Keto, Low-Carb, High-Protein, Spicy, Healthy

2. Translate name + description into French, Spanish, Chinese (Simplified).
   ⚠️ IMPORTANT: If translations already exist in the database, they will not be overwritten.`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash-8b',
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: dietaryBatchSchema,
      temperature: 0.1,
      maxOutputTokens: 8192
    },
  });

  const result = JSON.parse(response.text.trim());
  return result.analyses || [];
}

// --- DB Updates ---
async function updateDishesInDatabase(analyzedDishes: any[]): Promise<number> {
  if (analyzedDishes.length === 0) return 0;

  let successCount = 0;

  for (const dish of analyzedDishes) {
    try {
      // Fetch current dish first to check if translations already exist
      const { data: currentDish, error: fetchError } = await supabaseAdmin
        .from('menu_items')
        .select('translations')
        .eq('id', dish.dish_id)
        .single();

      if (fetchError) {
        console.error(`Failed to fetch existing dish ${dish.dish_id}:`, fetchError);
        continue;
      }

      // Only include translations if not already present
      let newTranslations = currentDish?.translations || {};
      if (!newTranslations.fr && !newTranslations.es && !newTranslations.zh) {
        newTranslations = dish.translations || {};
      }

      const { error } = await supabaseAdmin
        .from('menu_items')
        .update({
          allergens: dish.allergens || [],
          dietary_tags: dish.dietary_tags || [],
          translations: newTranslations
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

// --- Menu Status ---
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
      updated_at: new Date().toISOString()
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
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON in request body' }) };
  }

  const { menuId } = requestBody;
  if (!menuId) return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'menuId is required' }) };

  if (!geminiApiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    console.log(`Starting dietary + translation analysis for menu: ${menuId}`);

    const { data: dishes, error: fetchError } = await supabaseAdmin
      .from('menu_items')
      .select('id, name, description, translations, menu_id')
      .eq('menu_id', menuId)
      .order('created_at');

    if (fetchError) throw fetchError;
    if (!dishes || dishes.length === 0) {
      await markMenuComplete(menuId, 0, 0);
      return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ success: true, message: 'No dishes found', processed: 0, menuId }) };
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    let totalProcessed = 0;
    const totalDishes = dishes.length;
    const BATCH_SIZE = 4;

    for (let i = 0; i < dishes.length; i += BATCH_SIZE) {
      const batch = dishes.slice(i, i + BATCH_SIZE);
      try {
        const analyzedDishes = await processDishBatch(batch, ai);
        if (analyzedDishes.length > 0) {
          totalProcessed += await updateDishesInDatabase(analyzedDishes);
        }
        if (i < dishes.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (batchError) {
        console.error(`Batch error:`, batchError);
      }
    }

    await markMenuComplete(menuId, totalProcessed, totalDishes);
    const processingTime = Date.now() - startTime;

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        menuId,
        processed: totalProcessed,
        total: totalDishes,
        processingTime
      })
    };

  } catch (error) {
    console.error('Dietary analysis error:', error);
    await supabaseAdmin.from('menus').update({ status: 'error', error_message: String(error) }).eq('id', menuId);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Dietary analysis failed', menuId }) };
  }
};
