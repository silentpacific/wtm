// netlify/functions/menu-scanner.ts - Updated with restaurantId param
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Simple slug generator (avoids external dependency)
function makeSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')   // replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');      // trim leading/trailing dashes
}

// Schema for menu extraction
const menuExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    restaurant: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        phone: { type: Type.STRING },
        website: { type: Type.STRING }
      }
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER }
              },
              required: ["name"]
            }
          }
        },
        required: ["name", "dishes"]
      }
    }
  },
  required: ["sections"]
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Generate unique menu ID
function generateMenuId(): string {
  return 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// --- Save menu & dishes ---
async function saveMenuToDatabase(menuId: string, restaurantId: string, menuData: any) {
  try {
    console.log(`Saving menu ${menuId} for restaurant ${restaurantId}`);

    // Update restaurant info if AI extracted some
    if (menuData.restaurant?.name) {
      await supabaseAdmin
        .from('user_restaurant_profiles')
        .update({
          restaurant_name: menuData.restaurant.name,
          address: menuData.restaurant.address || null,
          phone: menuData.restaurant.phone || null
        })
        .eq('auth_user_id', restaurantId);
    }

    // Insert menu
    const slug = makeSlug(menuData.restaurant?.name || "menu") + "-" + Date.now();
    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .insert({
        id: menuId,
        restaurant_id: restaurantId,
        name: menuData.restaurant?.name || 'Uploaded Menu',
        url_slug: slug,
        status: 'processing'
      })
      .select()
      .single();

    if (menuError) throw menuError;

    // Insert sections + dishes
    for (const [sectionIndex, section] of menuData.sections.entries()) {
      const { data: sectionData, error: sectionError } = await supabaseAdmin
        .from('menu_sections')
        .insert({
          menu_id: menuId,
          name: section.name,
          display_order: sectionIndex
        })
        .select()
        .single();

      if (sectionError) {
        console.error('Section insert error:', sectionError);
        continue;
      }

      if (section.dishes && section.dishes.length > 0) {
        const dishInserts = section.dishes.map((dish: any, index: number) => ({
          menu_id: menuId,
          section_id: sectionData.id,
          name: dish.name,
          description: dish.description || null,
          price: dish.price || null,
          allergens: [],
          dietary_tags: [],
          explanation: null,
          translations: {}
        }));

        const { error: dishError } = await supabaseAdmin
          .from('menu_items')
          .insert(dishInserts);

        if (dishError) {
          console.error('Dish insert error:', dishError);
        } else {
          console.log(`Inserted ${dishInserts.length} dishes into ${sectionData.name}`);
        }
      }
    }

    return menu;
  } catch (error) {
    console.error('saveMenuToDatabase error:', error);
    throw error;
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const startTime = Date.now();

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'POST only' }) };
  }

  // Parse request
  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { fileData, fileName, mimeType, restaurantId } = requestBody;
  if (!fileData || !fileName || !mimeType || !restaurantId) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'fileData, fileName, mimeType, and restaurantId are required' })
    };
  }

  if (!geminiApiKey) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Server config missing' }) };
  }

  try {
    console.log(`Scanning menu for restaurant ${restaurantId}: ${fileName}`);

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const menuId = generateMenuId();

    // Prompt
    const extractionPrompt = `Extract the full menu structure... (same as before)`;

    const menuParts = [
      { text: extractionPrompt },
      {
        inlineData: {
          data: fileData.replace(/^data:[^;]+;base64,/, ''),
          mimeType
        }
      }
    ];

    const extractionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: menuParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuExtractionSchema,
        temperature: 0.1,
        maxOutputTokens: 8192
      },
    });

    const menuData = JSON.parse(extractionResponse.text.trim());

    // Validation
    if (!menuData.sections?.length) throw new Error('No menu sections found');
    const totalDishes = menuData.sections.reduce((n: number, s: any) => n + (s.dishes?.length || 0), 0);
    if (totalDishes === 0) throw new Error('No dishes found');

    // Save
    await saveMenuToDatabase(menuId, restaurantId, menuData);

    const processingTime = Date.now() - startTime;
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        menuId,
        data: { restaurant: menuData.restaurant || {}, sections: menuData.sections },
        stats: { sections: menuData.sections.length, totalDishes, processingTime }
      })
    };
  } catch (error) {
    console.error('menu-scanner error:', error);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'Menu processing failed' }) };
  }
};
