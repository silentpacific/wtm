import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Define the schema for menu scanning response
const menuScanSchema = {
    type: Type.OBJECT,
    properties: {
        restaurant_name: {
            type: Type.STRING,
            description: "The name of the restaurant if visible on the menu"
        },
        cuisine_type: {
            type: Type.STRING,
            description: "The type of cuisine (e.g., 'Italian', 'Mexican', 'Chinese', etc.)"
        },
        dishes: {
            type: Type.ARRAY,
            description: "Array of all dishes found on the menu",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The name of the dish"
                    },
                    section: {
                        type: Type.STRING,
                        description: "Menu section (e.g., 'Appetizers', 'Mains', 'Desserts', 'Drinks')"
                    },
                    price: {
                        type: Type.NUMBER,
                        description: "Price of the dish if visible"
                    },
                    description: {
                        type: Type.STRING,
                        description: "Brief description of the dish if available"
                    },
                    allergens: {
                        type: Type.ARRAY,
                        description: "Potential allergens in the dish",
                        items: { type: Type.STRING }
                    },
                    dietary_tags: {
                        type: Type.ARRAY,
                        description: "Dietary tags like 'Vegetarian', 'Vegan', 'Gluten-Free'",
                        items: { type: Type.STRING }
                    }
                },
                required: ["name", "section"]
            }
        },
        header_notes: {
            type: Type.STRING,
            description: "Any header text or restaurant information from the menu"
        },
        footer_notes: {
            type: Type.STRING,
            description: "Any footer text, policies, or special notes from the menu"
        },
        special_notes: {
            type: Type.STRING,
            description: "Any other important information from the menu"
        }
    },
    required: ["dishes", "cuisine_type"]
};

// Initialize Supabase and Gemini
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
    console.error('Missing environment variables for menu scanning');
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
    const startTime = Date.now();

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
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

    const { image, filename, restaurantId, restaurantName, scanType } = requestBody;

    // Validate required fields
    if (!image) {
        return { 
            statusCode: 400, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "Image data is required." })
        };
    }

    if (!geminiApiKey) {
        return { 
            statusCode: 500, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "AI service not configured." })
        };
    }

    try {
        console.log(`🍽️ Processing menu scan for restaurant: ${restaurantName || restaurantId}`);
        console.log(`📁 File: ${filename}, Scan type: ${scanType}`);

        // Initialize Gemini AI
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        // Create the prompt for menu analysis
        const prompt = `You are a professional menu digitization expert. Analyze this restaurant menu image and extract all the information systematically.

IMPORTANT: Look carefully at the image and identify:

1. **All dishes and food items** with their names exactly as written
2. **Menu sections** (Appetizers, Mains, Entrees, Desserts, Beverages, etc.)
3. **Prices** for each item if visible
4. **Descriptions** for dishes if provided
5. **Restaurant name** if visible
6. **Cuisine type** based on the dishes
7. **Special notes** like "GF" for gluten-free, "V" for vegetarian, etc.

For each dish, also determine:
- **Potential allergens** (gluten, dairy, nuts, shellfish, eggs, etc.)
- **Dietary tags** (vegetarian, vegan, gluten-free, etc.) based on ingredients

If the image is unclear or not a menu, return an empty dishes array.

Extract ALL visible food items, even if they're in different sections or formats.

Return the data in the specified JSON format.`;

        // Prepare the image part for Gemini
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: filename?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
            }
        };

        // Call Gemini Vision API
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Use the vision-capable model
            contents: { 
                parts: [
                    { text: prompt },
                    imagePart
                ] 
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: menuScanSchema,
            },
        });

        const jsonText = response.text.trim();
        const menuScanResult = JSON.parse(jsonText);

        console.log(`✅ Menu scan completed. Found ${menuScanResult.dishes?.length || 0} dishes`);
        console.log(`🍴 Cuisine type: ${menuScanResult.cuisine_type}`);

        // Save scan result to database for analytics
        if (restaurantId && menuScanResult.dishes?.length > 0) {
            try {
                const { error: updateError } = await supabaseAdmin
                    .rpc('increment_restaurant_menu_scans', { 
                        restaurant_id: parseInt(restaurantId) 
                    });
                    
                if (updateError) {
                    console.error('Error updating restaurant scan count:', updateError);
                } else {
                    console.log(`📊 Updated scan count for restaurant ${restaurantId}`);
                }
            } catch (error) {
                console.error('Error updating restaurant analytics:', error);
            }
        }

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Processing-Time': (Date.now() - startTime).toString(),
                'X-Dishes-Found': (menuScanResult.dishes?.length || 0).toString()
            },
            body: JSON.stringify(menuScanResult)
        };

    } catch (error) {
        console.error("❌ Error in menu scanning:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: `Failed to scan menu. ${errorMessage}`,
                details: scanType === 'debug' ? errorMessage : undefined
            })
        };
    }
};