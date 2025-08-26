// netlify/functions/menu-scanner.ts
import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Schema for menu extraction
const menuExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    restaurant: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Restaurant name if visible on menu" },
        address: { type: Type.STRING, description: "Restaurant address if visible" },
        phone: { type: Type.STRING, description: "Restaurant phone if visible" },
        website: { type: Type.STRING, description: "Restaurant website if visible" }
      }
    },
    sections: {
      type: Type.ARRAY,
      description: "Menu sections in order they appear",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Section name (e.g., Appetizers, Main Courses, Desserts)" },
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "Dish name exactly as written" },
                description: { type: Type.STRING, description: "Dish description if available" },
                price: { type: Type.STRING, description: "Price as written (e.g., $15.99, £12.50)" }
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

// Schema for dietary analysis
const dietaryAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    allergens: {
      type: Type.ARRAY,
      description: "Allergens present in the dish",
      items: { type: Type.STRING }
    },
    dietaryTags: {
      type: Type.ARRAY,
      description: "Dietary classifications",
      items: { type: Type.STRING }
    }
  },
  required: ["allergens", "dietaryTags"]
};

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '');

// Rate limiting
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};

// Convert base64 to proper format for Gemini
function prepareImageForGemini(base64Data: string, mimeType: string) {
  // Remove data URL prefix if present
  const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
  
  return {
    inlineData: {
      data: base64Clean,
      mimeType: mimeType
    }
  };
}

// Analyze dish for allergens and dietary tags
async function analyzeDishDietary(dishName: string, description: string, ai: any): Promise<{allergens: string[], dietaryTags: string[]}> {
  const prompt = `Analyze this dish for allergens and dietary information:
  
Dish: "${dishName}"
Description: "${description}"

Identify:
1. Allergens: Common allergens this dish likely contains (Gluten, Dairy, Eggs, Nuts, Soy, Fish, Shellfish, Sesame, etc.)
2. Dietary tags: Dietary classifications (Vegetarian, Vegan, Gluten-Free, Dairy-Free, High-Protein, Spicy, etc.)

Be conservative - only include allergens/tags you're confident about based on typical preparations of this dish.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: dietaryAnalysisSchema,
      },
    });

    const result = JSON.parse(response.text.trim());
    return {
      allergens: result.allergens || [],
      dietaryTags: result.dietaryTags || []
    };
  } catch (error) {
    console.error('Error analyzing dish dietary info:', error);
    return { allergens: [], dietaryTags: [] };
  }
}

export const handler: Handler = async (event: HandlerEvent) => {
  const startTime = Date.now();

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
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  // Rate limiting
  const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                   event.headers['x-real-ip'] || 
                   'unknown';
  
  if (!checkRateLimit(clientIP, 5, 3600000)) { // 5 menu scans per hour
    return {
      statusCode: 429,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Too many menu scans. Please wait before trying again.' 
      })
    };
  }

  // Authentication check
  const authHeader = event.headers.authorization;
  let userId = null;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Authentication required' })
    };
  }

  const token = authHeader.substring(7);
  
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
  } catch (authError) {
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
  } catch (parseError) {
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
      body: JSON.stringify({ 
        error: `Unsupported file type. Supported types: ${supportedTypes.join(', ')}` 
      })
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
    console.log(`Processing menu scan: ${fileName} (${mimeType}) for user ${userId}`);
    
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Step 1: Extract menu structure
    const extractionPrompt = `You are a menu digitization expert. Analyze this menu image/PDF and extract all information in the exact order it appears.

EXTRACT:
1. Restaurant information (name, address, phone, website) if visible
2. All menu sections in the order they appear (Appetizers, Soups, Mains, Desserts, etc.)
3. For each section, list ALL dishes in the exact order they appear
4. For each dish, extract:
   - Exact dish name as written
   - Description (if provided)
   - Price (exactly as written, including currency symbols)

IMPORTANT:
- Maintain the original order of sections and dishes
- Include ALL items, even if some information is missing
- If no description exists, leave it empty
- If no price is visible, leave it empty
- Be precise with dish names and descriptions
- Don't add or interpret information that isn't clearly visible

Return the extracted information in the specified JSON format.`;

    let menuParts;
    if (mimeType === 'application/pdf') {
      // For PDFs, we'll need to handle them as documents
      menuParts = [
        { text: extractionPrompt },
        {
          inlineData: {
            data: fileData.replace(/^data:[^;]+;base64,/, ''),
            mimeType: mimeType
          }
        }
      ];
    } else {
      // For images
      menuParts = [
        { text: extractionPrompt },
        prepareImageForGemini(fileData, mimeType)
      ];
    }

    console.log('Calling Gemini for menu extraction...');
    const extractionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: menuParts },
      config: {
        responseMimeType: "application/json",
        responseSchema: menuExtractionSchema,
      },
    });

    const menuData = JSON.parse(extractionResponse.text.trim());
    console.log(`Extracted ${menuData.sections?.length || 0} sections from menu`);

    // Step 2: Analyze each dish for allergens and dietary tags
    console.log('Analyzing dishes for dietary information...');
    const processedSections = [];

    for (const section of menuData.sections || []) {
      const processedDishes = [];
      
      for (const dish of section.dishes || []) {
        console.log(`Analyzing dish: ${dish.name}`);
        
        // Get dietary analysis for each dish
        const dietaryInfo = await analyzeDishDietary(
          dish.name,
          dish.description || '',
          ai
        );

        processedDishes.push({
          name: dish.name,
          description: dish.description || '',
          price: dish.price || '',
          allergens: dietaryInfo.allergens,
          dietaryTags: dietaryInfo.dietaryTags
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      processedSections.push({
        name: section.name,
        dishes: processedDishes
      });
    }

    const finalMenuData = {
      restaurant: menuData.restaurant || {},
      sections: processedSections
    };

    console.log(`Menu processing completed in ${Date.now() - startTime}ms`);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Processing-Time': (Date.now() - startTime).toString()
      },
      body: JSON.stringify({
        success: true,
        data: finalMenuData,
        stats: {
          sections: finalMenuData.sections.length,
          totalDishes: finalMenuData.sections.reduce((total, section) => total + section.dishes.length, 0),
          processingTime: Date.now() - startTime
        }
      })
    };

  } catch (error) {
    console.error('Error in menu scanner:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: `Failed to process menu: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    };
  }
};