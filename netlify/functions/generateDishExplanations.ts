import type { Handler, HandlerEvent } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

// Initialize services
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
};

export const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    try {
        const { restaurantId, dishName, language = 'en', restaurantName } = JSON.parse(event.body || '{}');

        if (!restaurantId || !dishName) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: 'Restaurant ID and dish name are required' })
            };
        }

        console.log(`🧠 Generating ${language} explanation for: ${dishName} (Restaurant ${restaurantId})`);

        // Generate AI explanation using existing logic
        const explanation = await generateExplanationWithAI(dishName, language, restaurantId, restaurantName);
        
        // Save to dishes cache table (same as consumer app uses)
        const { error: saveError } = await supabaseAdmin
            .from('dishes')
            .upsert({
                name: dishName,
                explanation: explanation.explanation,
                tags: explanation.tags,
                allergens: explanation.allergens,
                cuisine: explanation.cuisine || 'international',
                language: language,
                restaurant_id: parseInt(restaurantId),
                restaurant_name: restaurantName || 'Restaurant',
                menu_language: language
            });

        if (saveError) {
            console.error('Error saving explanation:', saveError);
            throw new Error('Failed to save explanation');
        }

        console.log(`✅ Generated and saved ${language} explanation for: ${dishName}`);

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                success: true,
                dishName,
                language,
                explanation: explanation.explanation,
                tags: explanation.tags,
                allergens: explanation.allergens
            })
        };

    } catch (error) {
        console.error('Error generating dish explanation:', error);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                error: 'Failed to generate explanation',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
};

// Reuse the existing AI generation logic from getDishExplanation.ts
async function generateExplanationWithAI(dishName: string, language: string, restaurantId: string, restaurantName?: string) {
    const prompt = `You are a helpful restaurant assistant. Explain this dish: "${dishName}"

Language: ${language}
Restaurant context: ${restaurantName || 'Restaurant'} (ID: ${restaurantId})

Provide:
1. A clear, appetizing description (2-3 sentences)
2. Key ingredients 
3. Allergen information (common allergens like dairy, gluten, nuts, etc.)
4. Dietary tags (vegetarian, vegan, spicy, etc.)
5. Cuisine style if identifiable

Respond in ${language === 'en' ? 'English' : language === 'es' ? 'Spanish' : language === 'zh' ? 'Chinese' : 'French'}.

Format as JSON:
{
  "explanation": "Clear description of the dish",
  "tags": ["vegetarian", "spicy", "popular"],
  "allergens": ["dairy", "gluten"],
  "cuisine": "italian"
}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                responseMimeType: "application/json"
            }
        });

        const result = JSON.parse(response.text);
        
        return {
            explanation: result.explanation || `Delicious ${dishName}`,
            tags: result.tags || [],
            allergens: result.allergens || [],
            cuisine: result.cuisine || 'international'
        };

    } catch (error) {
        console.error('AI generation error:', error);
        // Fallback response
        return {
            explanation: `${dishName} - A delicious dish from our menu`,
            tags: [],
            allergens: [],
            cuisine: 'international'
        };
    }
}