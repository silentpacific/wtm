// netlify/functions/menu-scanner.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Schema for menu extraction - simplified for speed
const menuExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    restaurant: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Restaurant name if visible" },
        address: { type: Type.STRING, description: "Restaurant address if visible" },
        phone: { type: Type.STRING, description: "Restaurant phone if visible" },
        website: { type: Type.STRING, description: "Restaurant website if visible" }
      }
    },
    sections: {
      type: Type.ARRAY,
      description: "Menu sections in order",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Section name" },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Dish name exactly as written" },
                description: { type: Type.STRING, description: "Dish description if available" },
                price: { type: Type.NUMBER, description: "Price as number (extract from $15.99 -> 15.99)" }
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

// Save menu to database
async function saveMenuToDatabase(menuId: string, userId: string, menuData: any) {
  // 1. Save/update restaurant info if provided
  if (menuData.restaurant?.name) {
    await supabaseAdmin
      .from('restaurants')
      .update({
        name: menuData.restaurant.name,
        address: menuData.restaurant.address || null,
        phone: menuData.restaurant.phone || null,
        website: menuData.restaurant.website || null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', userId);
  }

  // 2. Save menu
  const { data: menu, error: menuError } = await supabaseAdmin
    .from('menus')
    .upsert({
      id: menuId,
      restaurant_id: userId, // Using auth_user_id as restaurant identifier
      name: menuData.restaurant?.name || 'Uploaded Menu',
      status: 'processing', // Will be updated to 'active' after dietary analysis
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (menuError) throw menuError;

  // 3. Save sections and dishes
  for (const section of menuData.sections) {
    const { data: sectionData, error: sectionError } = await supabaseAdmin
      .from('menu_sections')
      .upsert({
        menu_id: menuId,
        name: section.name,
        display_order: menuData.sections.indexOf(section)
      })
      .select()
      .single();

    if (sectionError) throw sectionError;

    // Save dishes for this section
    const dishInserts = section.dishes.map((dish: any, index: number) => ({
      menu_id: menuId,
      section_id: sectionData.id,
      name: dish.name,
      description: dish.description || null,
      price: dish.price || null,
      display_order: index,
      // Placeholder values - will be filled by dietary analysis
      allergens: [],
      dietary_tags: [],
      needs_dietary_analysis: true
    }));

    if (dishInserts.length > 0) {
      const { error: dishError } = await supabaseAdmin
        .from('menu_items')
        .upsert(dishInserts);

      if (dishError) throw dishError;
    }
  }

  return menu;
}

// Trigger background dietary analysis
async function triggerDietaryAnalysis(menuId: string) {
  try {
    // Call the dietary analysis function
    const response = await fetch(`${process.env.NETLIFY_URL}/.netlify/functions/dietary-analyzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId })
    });

    if (!response.ok) {
      console.error('Failed to trigger dietary analysis:', response.statusText);
    }
  } catch (error) {
    console.error('Error triggering dietary analysis:', error);
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Auth check
  const authHeader = event.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }

  const token = authHeader.substring(7);
  let userId: string;

  try {
    const supabaseAuth = createClient(supabaseUrl || '', process.env.SUPABASE_ANON_KEY || '');
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      return {
        statusCode: 401,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }
    
    userId = user.id;
  } catch {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Authentication failed' })
    };
  }

  // Parse request
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

  const { fileData, fileName, mimeType } = requestBody;

  if (!fileData || !fileName || !mimeType) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'fileData, fileName, and mimeType required' })
    };
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!supportedTypes.includes(mimeType)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Unsupported file type: ${mimeType}` })
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
    console.log(`Processing menu: ${fileName} for user ${userId}`);
    
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const menuId = generateMenuId();

    // Fast menu extraction - single API call
    const extractionPrompt = `Extract menu information from this ${mimeType.includes('pdf') ? 'PDF' : 'image'}:

EXTRACT EXACTLY:
1. Restaurant name/info (if visible)
2. All menu sections in order (Appetizers, Mains, etc.)
3. For each dish: name, description (if any), price as number

IMPORTANT:
- Extract prices as numbers only (from "$15.99" extract 15.99)
- Maintain exact order of sections and dishes
- Include ALL visible items
- If no price visible, omit price field
- Be precise with names and descriptions

This is the ONLY information needed - do not analyze ingredients or allergens.`;

    const menuParts = [
      { text: extractionPrompt },
      {
        inlineData: {
          data: fileData.replace(/^data:[^;]+;base64,/, ''),
          mimeType: mimeType
        }
      }
    ];

    console.log('Calling Gemini for menu extraction...');
    const extractionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: menuParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuExtractionSchema,
        temperature: 0.1 // Low temperature for consistent extraction
      },
    });

    const menuData = JSON.parse(extractionResponse.text.trim());
    console.log(`Extracted ${menuData.sections?.length || 0} sections`);

    // Save to database
    console.log('Saving menu to database...');
    const savedMenu = await saveMenuToDatabase(menuId, userId, menuData);

    // Calculate stats
    const totalDishes = menuData.sections?.reduce((total: number, section: any) => 
      total + (section.dishes?.length || 0), 0) || 0;

    console.log(`Menu saved. Starting dietary analysis for ${totalDishes} dishes...`);
    
    // Trigger background dietary analysis (non-blocking)
    triggerDietaryAnalysis(menuId);

    const processingTime = Date.now() - startTime;
    console.log(`Menu extraction completed in ${processingTime}ms`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        menuId: menuId,
        data: {
          restaurant: menuData.restaurant || {},
          sections: menuData.sections || []
        },
        stats: {
          sections: menuData.sections?.length || 0,
          totalDishes,
          processingTime
        },
        message: totalDishes > 0 
          ? `Menu extracted successfully. Dietary analysis is processing in the background for ${totalDishes} dishes.`
          : 'Menu extracted successfully.'
      })
    };

  } catch (error) {
    console.error('Menu scanning error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: `Menu processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        processingTime: Date.now() - startTime
      })
    };
  }
};