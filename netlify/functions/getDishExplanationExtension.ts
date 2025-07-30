import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI, Type } from "@google/genai";

const explanationSchema = {
    type: Type.OBJECT,
    properties: {
        explanation: {
            type: Type.STRING,
            description: "A concise explanation of the dish in under 300 characters. Should be easy for a tourist to understand."
        },
        tags: {
            type: Type.ARRAY,
            description: "An array of dietary and flavor tags (e.g., 'Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Sweet', 'Grilled', 'Fried').",
            items: {
                type: Type.STRING
            }
        },
        allergens: {
            type: Type.ARRAY,
            description: "An array of allergen information (e.g., 'Contains Nuts', 'Contains Dairy', 'Contains Gluten', 'Contains Shellfish', 'Contains Eggs').",
            items: {
                type: Type.STRING
            }
        },
        cuisine: {
            type: Type.STRING,
            description: "The specific cuisine type (e.g., 'Italian', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French', 'Chinese', 'Mediterranean', 'American', 'Korean', 'Vietnamese', 'Greek', 'Spanish', 'Lebanese', 'Moroccan', etc.). Be specific and precise."
        }
    },
    required: ["explanation", "tags", "allergens", "cuisine"]
};

const geminiApiKey = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiting for extensions
interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(identifier: string, maxRequests: number = 60, windowMs: number = 3600000): boolean {
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

const getLanguagePrompt = (dishName: string): string => {
    return `You are a culinary expert. Explain the dish "${decodeURIComponent(dishName)}". 
    Provide a concise explanation suitable for a tourist in under 300 characters. 
    
    For tags, include: dietary restrictions (Vegetarian, Vegan, Gluten-Free, Dairy-Free), cooking methods (Grilled, Fried, Steamed, Raw), and flavor profiles (Spicy, Sweet, Savory, Mild, Hot).
    
    For allergens, specifically list what the dish contains using this format: "Contains [allergen]" (e.g., "Contains Nuts", "Contains Dairy", "Contains Gluten", "Contains Shellfish", "Contains Eggs", "Contains Fish", "Contains Soy").
    
    For cuisine, identify the specific cuisine type (e.g., "Italian", "Japanese", "Mexican", "Indian", "Thai", "French", "Chinese", "Mediterranean", "American", "Korean", "Vietnamese", "Greek", "Spanish", "Lebanese", "Moroccan", etc.). Be specific - use the most precise cuisine classification.
    
    If the dish doesn't contain common allergens, return an empty array for allergens.
    
    Respond in the requested JSON format.`;
};

export const handler: Handler = async (event: HandlerEvent) => {
    const startTime = Date.now();

    // CORS headers - more permissive for extension
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, User-Agent',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'false'
    };

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

    // Rate limiting by IP (more generous for extensions)
    const clientIP = event.headers['x-forwarded-for']?.split(',')[0] || 
                     event.headers['x-real-ip'] || 
                     'unknown';
    
    if (!checkRateLimit(clientIP, 60, 3600000)) { // 60 requests per hour
        return {
            statusCode: 429,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: 'Too many requests. Please wait before trying again.' 
            })
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

    const { dishName } = requestBody;

    // Validate required fields
    if (!dishName) {
        return { 
            statusCode: 400, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "dishName is required." })
        };
    }

    if (!geminiApiKey) {
        return { 
            statusCode: 500, 
            headers: corsHeaders,
            body: JSON.stringify({ error: "Server configuration error." })
        };
    }

    try {
        console.log(`🔍 [Extension] Processing dish explanation request: "${dishName}"`);
        
        // Call Gemini API directly (no database caching for extension to keep it simple)
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = getLanguagePrompt(dishName);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: explanationSchema,
            },
        });

        const jsonText = response.text.trim();
        const dishExplanation = JSON.parse(jsonText);

        console.log(`✅ [Extension] Successfully explained: "${dishName}"`);
        
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-Data-Source': 'Gemini-API-Extension',
                'X-Processing-Time': (Date.now() - startTime).toString()
            },
            body: JSON.stringify(dishExplanation)
        };

    } catch (error) {
        console.error("❌ [Extension] Error in getDishExplanationExtension function:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown internal error occurred.";
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
                error: `Failed to get explanation for "${dishName}". Reason: ${errorMessage}` 
            })
        };
    }
};