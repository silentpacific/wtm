// netlify/functions/menu-scanner.ts - Complete updated version
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Schema for menu extraction - optimized for speed
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

// Rate limiting
const rateLimitMap = new Map();
function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

// Save menu to database using clean schema
async function saveMenuToDatabase(menuId: string, userId: string, menuData: any) {
  try {
    console.log(`Saving menu ${menuId} to database`);

    // 1. Update restaurant info if provided
    if (menuData.restaurant?.name) {
      const { error: restaurantError } = await supabaseAdmin
        .from('user_restaurant_profiles')
        .update({
          name: menuData.restaurant.name,
          address: menuData.restaurant.address || null,
          phone: menuData.restaurant.phone || null,
          website: menuData.restaurant.website || null
        })
        .eq('auth_user_id', userId);
      
      if (restaurantError) {
        console.warn('Failed to update restaurant info:', restaurantError);
      }
    }

    // 2. Save menu
    const { data: menu, error: menuError } = await supabaseAdmin
      .from('menus')
      .insert({
        id: menuId,
        restaurant_id: userId,
        name: menuData.restaurant?.name || 'Uploaded Menu',
        status: 'processing'
      })
      .select()
      .single();

    if (menuError) {
      console.error('Menu save error:', menuError);
      throw menuError;
    }

    console.log(`Menu saved: ${menu.id}`);

    // 3. Save sections and dishes
    for (const section of menuData.sections) {
      const { data: sectionData, error: sectionError } = await supabaseAdmin
        .from('menu_sections')
        .insert({
          menu_id: menuId,
          name: section.name,
          display_order: menuData.sections.indexOf(section)
        })
        .select()
        .single();

      if (sectionError) {
        console.error('Section error:', sectionError);
        continue;
      }

      console.log(`Section saved: ${sectionData.name} (${section.dishes?.length || 0} dishes)`);

      // Save dishes for this section
      if (section.dishes && section.dishes.length > 0) {
        const dishInserts = section.dishes.map((dish: any, index: number) => ({
          menu_id: menuId,
          section_id: sectionData.id,
          name: dish.name,
          description: dish.description || null,
          price: dish.price || null,
          display_order: index,
          allergens: [],
          dietary_tags: [],
          needs_dietary_analysis: true
        }));

        const { error: dishError } = await supabaseAdmin
          .from('menu_items')
          .insert(dishInserts);

        if (dishError) {
          console.error('Dish insert error:', dishError);
        } else {
          console.log(`Inserted ${dishInserts.length} dishes for section ${sectionData.name}`);
        }
      }
    }

    return menu;
  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

// Trigger background dietary analysis
async function triggerDietaryAnalysis(menuId: string) {
  try {
    const netlifyUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
    if (!netlifyUrl) {
      console.error('No Netlify URL found for background function');
      return;
    }

    console.log(`Triggering dietary analysis for menu: ${menuId}`);
    
    const response = await fetch(`${netlifyUrl}/.netlify/functions/dietary-analyzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menuId })
    });

    if (!response.ok) {
      console.error('Failed to trigger dietary analysis:', response.status, response.statusText);
    } else {
      console.log('Dietary analysis triggered successfully');
    }
  } catch (error) {
    console.error('Error triggering dietary analysis:', error);
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const startTime = Date.now();

  // Handle preflight requests
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

  // Rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  if (!checkRateLimit(clientIP, 10, 3600000)) {
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Too many menu scans. Please wait before trying again.' })
    };
  }

  // Authentication
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
        body: JSON.stringify({ error: 'Invalid authentication token' })
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

  // Parse request body
  let requestBody;
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }
    requestBody = JSON.parse(event.body);
  } catch {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  const { fileData, fileName, mimeType } = requestBody;

  // Validate required fields
  if (!fileData || !fileName || !mimeType) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'fileData, fileName, and mimeType are required' })
    };
  }

  // Validate file type
  const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!supportedTypes.includes(mimeType)) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: `Unsupported file type: ${mimeType}. Supported: ${supportedTypes.join(', ')}` })
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
    console.log(`Processing menu: ${fileName} (${mimeType}) for user ${userId}`);
    
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const menuId = generateMenuId();

    // Fast menu extraction - single API call
    const extractionPrompt = `Extract menu information from this ${mimeType.includes('pdf') ? 'PDF document' : 'image'}:

EXTRACT EXACTLY:
1. Restaurant information (name, address, phone, website) if visible
2. All menu sections in the exact order they appear (Appetizers, Soups, Salads, Mains, Desserts, Beverages, etc.)
3. For each section, list ALL dishes in the exact order shown
4. For each dish extract:
   - Name exactly as written
   - Description (if provided)  
   - Price as a number only (from "$15.99" extract 15.99, from "£12.50" extract 12.50)

IMPORTANT RULES:
- Maintain exact order of sections and dishes as they appear
- Include ALL visible items, even if some information is missing
- Extract prices as numbers only - remove currency symbols and text
- If no price is visible, omit the price field entirely
- Be precise with dish names and descriptions
- Do NOT analyze ingredients, allergens, or dietary information (that comes later)

Focus only on extracting the menu structure and basic information.`;

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
        temperature: 0.1,
        maxOutputTokens: 8192
      },
    });

    const menuData = JSON.parse(extractionResponse.text.trim());
    console.log(`Extracted ${menuData.sections?.length || 0} sections from menu`);

    // Validate extracted data
    if (!menuData.sections || menuData.sections.length === 0) {
      throw new Error('No menu sections found. Please ensure the image/PDF is clear and contains a visible menu.');
    }

    // Calculate total dishes
    const totalDishes = menuData.sections.reduce((total: number, section: any) => 
      total + (section.dishes?.length || 0), 0);

    if (totalDishes === 0) {
      throw new Error('No dishes found in menu. Please ensure the menu content is clearly visible.');
    }

    console.log(`Found ${totalDishes} dishes across ${menuData.sections.length} sections`);

    // Save to database
    console.log('Saving menu to database...');
    const savedMenu = await saveMenuToDatabase(menuId, userId, menuData);

    console.log(`Menu saved successfully. Ready for dietary analysis of ${totalDishes} dishes...`);
    
    // Don't automatically trigger dietary analysis - wait for user action
    // triggerDietaryAnalysis(menuId);

    const processingTime = Date.now() - startTime;
    console.log(`Menu extraction completed in ${processingTime}ms`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Processing-Time': processingTime.toString()
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
        message: `Menu extracted successfully! Found ${totalDishes} dishes across ${menuData.sections?.length || 0} sections. Click "Add Dietary Tags" when ready to analyze allergens and dietary information.`
      })
    };

  } catch (error) {
    console.error('Menu scanning error:', error);
    
    // Provide helpful error messages
    let errorMessage = 'Menu processing failed';
    if (error instanceof Error) {
      if (error.message.includes('No menu sections found') || error.message.includes('No dishes found')) {
        errorMessage = error.message;
      } else if (error.message.includes('JSON')) {
        errorMessage = 'Failed to parse menu content. Please ensure the image/PDF is clear and readable.';
      } else if (error.message.includes('quota') || error.message.includes('rate')) {
        errorMessage = 'Service temporarily overloaded. Please try again in a few minutes.';
      } else {
        errorMessage = `Menu processing failed: ${error.message}`;
      }
    }

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: errorMessage,
        processingTime: Date.now() - startTime,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      })
    };
  }
};