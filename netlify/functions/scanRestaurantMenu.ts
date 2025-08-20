import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Simple schema - just dish names and sections (like consumer app)
const menuScanSchema = {
    type: Type.OBJECT,
    properties: {
        cuisine_type: {
            type: Type.STRING,
            description: "The type of cuisine if identifiable"
        },
        dishes: {
            type: Type.ARRAY,
            description: "Array of dish names and sections only",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The exact name of the dish as written"
                    },
                    section: {
                        type: Type.STRING,
                        description: "Menu section (e.g., 'Appetizers', 'Mains', 'Desserts', 'Drinks')"
                    },
                    price: {
                        type: Type.NUMBER,
                        description: "Price if clearly visible, otherwise null"
                    }
                },
                required: ["name", "section"]
            }
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

        // Use SIMPLE prompt like consumer app - just extract dish names and sections
        const prompt = `You are a menu scanner. Extract ONLY the dish names and their menu sections from this image.

DO NOT provide descriptions, ingredients, or detailed analysis. Just extract:
- Dish names exactly as written
- Which section each dish belongs to (Appetizers, Mains, Desserts, Drinks, etc.)
- Prices if clearly visible

Keep it simple and fast. Return only the basic structure.`;

        // Prepare the image part for Gemini
        const imagePart = {
            inlineData: {
                data: image,
                mimeType: filename?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
            }
        };

        // Call Gemini Vision API with SIMPLE request (like consumer app)
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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